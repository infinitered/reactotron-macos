# Taken from https://github.com/jamonholmgren/react-native-colo-loco
require 'xcodeproj'

# Color constants for output
R = "\033[31m"    # Red
RB = "\033[31;1m" # Red bold
G = "\033[32m"    # Green
GB = "\033[32;1m" # Green bold
Y = "\033[33m"    # Yellow 
YB = "\033[33;1m" # Yellow bold
D = "\033[90m"    # Dark gray
DB = "\033[90;1m" # Dark gray bold
S = "\033[9m"     # Strikethrough
X = "\033[0m"     # Reset

# This method will search your project files
# for Objective-C, Swift, or other native files
# and link them in the Xcode project.
#
# They will be grouped into a folder called "Colocated"
# and linked to all available targets.
def link_colocated_native_files(options = {})
  puts "🤪 #{GB}React Native Colo Loco#{X}"
  puts "#{D}Running ./bin/linker.rb from #{__FILE__}#{X}"
  puts ""


  _colocated_verify_options!(options)

  app_name = options[:app_name]
  app_path = options[:app_path]
  xcodeproj_path = options[:xcodeproj_path]
  excluded_targets = options[:exclude_targets] || []
  project_root = Pathname.new(File.dirname(xcodeproj_path)).parent

  relative_app_path = Pathname.new(app_path).relative_path_from(project_root)
  relative_xcodeproj_path = Pathname.new(xcodeproj_path).relative_path_from(project_root)

  puts "#{D}  App Name: #{GB}#{app_name}#{X}"
  puts "#{D}  App Path: #{GB}#{relative_app_path}#{X}"
  puts "#{D}  xcodeprj: #{G}#{relative_xcodeproj_path}#{X}"
  puts "#{D}  excluded: #{G}#{excluded_targets}#{X}"
  puts ""
  puts "#{D}Looking for files to link to #{GB}#{app_name}#{X} in #{G}#{relative_app_path}#{X}"
  puts ""
  

  # if app_path/ios/Podfile exists, stop and warn the user
  podfile_path = "#{app_path}/macos/Podfile"
  if File.exist?(podfile_path)
    puts "React Native Colo Loco error:"
    puts "  Podfile found in #{podfile_path}. We don't support specifying"
    puts "  the macos project root as your app_path."
    puts "  To fix this, change app_path to something like '../app'"
    puts "  (it is currently #{app_path})"
    puts "  Skipping linking of native files."
    puts ""
    return
  end

  if not File.exist?(app_path)
    puts "#{RB}React Native Colo Loco error:#{X}"
    puts ""
    puts "#{Y}  No files found in #{GB}#{app_path}#{X}#{Y}."
    puts "#{Y}  Please check your app_path.#{X}"
    puts "#{Y}  Skipping linking of native files.#{X}"
    puts ""
    return
  end

  # Get all the colocated files
  colocated_files = Dir.glob(File.join(app_path, '**/*.{h,m,mm,c,swift,cpp}')).map { |file| Pathname.new(file).realpath }
  # Add any in the generated headers folder
  generated_headers_path = File.join(File.dirname(xcodeproj_path), 'build', 'generated', 'headers')
  generated_headers = Dir.glob(File.join(generated_headers_path, '**/*.h')).map { |file| Pathname.new(file).realpath }
  colocated_files.concat(generated_headers)

  # Generate headers for any objective-c turbomodules that don't have a header
  colocated_files.each do |file|
    next if file.extname != '.m' and file.extname != '.mm'
    next if file.basename.to_s.include?('ComponentView')
    
    # Already have a header for this file
    next if colocated_files.map(&:basename).include?(file.sub_ext('.h').basename)
    
    # Generate the header for the file if it doesn't exist
    generated_header_file = _generate_objc_header({
      objc_file: file,
      xcodeproj_path: xcodeproj_path
    })
    colocated_files.push(generated_header_file) if generated_header_file
  end

  # if there are any colocated files, let's add them
  if colocated_files.length > 0
    project = Xcodeproj::Project.open(xcodeproj_path)
    file_group = project[app_name]

    if file_group.nil?
      puts "#{RB}React Native Colo Loco error:#{X}"
      puts ""
      puts "#{Y}  No project found in #{GB}#{xcodeproj_path}#{X}#{Y} with name #{GB}#{app_name}#{X}."
      puts "#{Y}  Skipping linking of native files.#{X}"
      puts ""
      puts "#{D}  Found:#{X}"
      project.targets.each do |target|
        puts "    #{D}#{target.name}#{X}"
      end
      puts ""
      return
    end
    
    # check if the "Colocated" group exists
    existing_group = file_group['Colocated']

    # Create the group if it doesn't exist
    colocated_group = existing_group || file_group.new_group('Colocated')
    colocated_group_files = colocated_group.files.map(&:real_path)

    

    # Remove files from the existing colocated file_group that are not present in the colocated_files array
    if existing_group
      existing_group.files.each do |file|
        if colocated_files.map(&:to_s).include?(file.real_path.to_s)
          relative_path = file.real_path.relative_path_from(project_root)
          dir_path = relative_path.dirname
          filename = relative_path.basename
          puts "#{DB} ✓ Checked    #{X}#{D}#{dir_path}/#{DB}#{filename}#{X}"
          next
        end
        relative_path = file.real_path.relative_path_from(project_root)
        dir_path = relative_path.dirname
        filename = relative_path.basename
        puts "#{YB} - Unlinked   #{X}#{S}#{D}#{dir_path}/#{YB}#{filename}#{X}"
        file.remove_from_project
      end
    end

    colocated_files.each do |file|
      next if colocated_group_files.include?(file)
    
      relative_path = file.relative_path_from(project_root)
      dir_path = relative_path.dirname
      filename = relative_path.basename
      puts "#{GB} + Linked     #{X}#{D}#{dir_path}/#{GB}#{filename}#{X}"
      new_file = colocated_group.new_file(file)
    
      # Check if this file specifies any Colo Loco targets
      file_content = File.read(file)
      targets_line = file_content[/colo_loco_targets:(.+)/, 1] # Get the line with the targets, if it exists
      specified_targets = targets_line&.split(',')&.map(&:strip) || []
    
      # Add the new file to all targets (or only the specified targets, if any)
      project.targets.each do |target|
        # Skip this target if it's in the excluded_targets list or if this file specifies targets and this target isn't one of them
        # next if (specified_targets.any? && !specified_targets.include?(target.name)) || (!specified_targets.any? && excluded_targets.include?(target.name))
    
        # If there are specified_targets, only add this file to the targets in that list;
        # otherwise, use the excluded_list to determine which targets to add this file to
        if specified_targets.any? ? specified_targets.include?(target.name) : !excluded_targets.include?(target.name)
          target.add_file_references([new_file])
        end
      end
    end

    puts ""
    print "#{D}Saving Xcode project #{G}#{xcodeproj_path}#{X}...#{X}"

    project.save

    puts "#{GB}Done.#{X}"
    puts ""
  else
    puts "#{Y}No colocated native files found in #{GB}#{app_path}#{X}#{Y}."
    puts "#{Y}Skipping linking of native files.#{X}"
    puts ""
  end
end

# Verify that the required options were provided
def _colocated_verify_options!(options)
  if options[:app_name].nil?
    raise "#{RB}link_colocated_native_files - You must specify the name of your app#{X}"
  end
  if options[:app_path].nil?
    raise "#{RB}link_colocated_native_files - You must specify a path to your app#{X}"
  end
  if options[:xcodeproj_path].nil?
    raise "#{RB}link_colocated_native_files - You must specify a path to your Xcode project#{X}"
  end
  if not File.exist?(options[:xcodeproj_path])
    raise "#{RB}link_colocated_native_files - Xcode project not found at #{GB}#{options[:xcodeproj_path]}#{X}#{RB}.#{X}"
  end
end

def _generate_objc_header(options = {})
  objc_file = (options[:objc_file] || "").to_s
  return if not objc_file.end_with?('.m') and not objc_file.end_with?('.mm')
  # Don't auto-generate headers for fabric components
  return if objc_file.ends_with?('ComponentView.h') or objc_file.ends_with?('ComponentView.mm') or objc_file.ends_with?('ComponentView.m')
  
  xcodeproj_path = options[:xcodeproj_path]
  all_linked_files = options[:all_linked_files] || []

  template_header = File.read(File.join(File.dirname(__FILE__), 'templates', 'MyTemplate.h'))
  generated_headers_path = File.join(File.dirname(xcodeproj_path), 'build', 'generated', 'headers')

  # Check if there's a header for each .m or .mm file
  # skip header files and other non-.m  .mm files
  file_no_ext = File.basename(objc_file, File.extname(objc_file))
  header_file = file_no_ext + ".h"
  header_file_path = File.join(generated_headers_path, header_file)
  # Check if the header file exists in the project, and don't generate it
  if all_linked_files.map { |f| File.basename(f) }.include?(header_file)
    puts "#{DB} ✓ Exists     #{X}#{D}#{header_file}#{X}"
  else
    header_file_content = template_header.gsub("MyTemplate", file_no_ext)
    FileUtils.mkdir_p(File.dirname(header_file_path))
    File.write(header_file_path, header_file_content)
    puts "#{GB} + Generated #{D} #{GB}#{header_file_path}#{X}"
  end
  # Return for link checking
  header_file_pathname = Pathname.new(header_file_path)
  return header_file_pathname if header_file_pathname.exist?
end
