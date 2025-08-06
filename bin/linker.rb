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

$dirty = false

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
  clean = options[:clean] || false
  project_root = Pathname.new(File.dirname(xcodeproj_path)).parent

  relative_app_path = Pathname.new(app_path).relative_path_from(project_root)
  relative_xcodeproj_path = Pathname.new(xcodeproj_path).relative_path_from(project_root)

  puts "#{D}  App Name: #{GB}#{app_name}#{X}"
  puts "#{D}  App Path: #{GB}#{relative_app_path}#{X}"
  puts "#{D}  xcodeprj: #{G}#{relative_xcodeproj_path}#{X}"
  puts "#{D}  excluded: #{G}#{excluded_targets}#{X}"
  puts "#{D}  clean: #{G}#{clean}#{X}" if clean
  puts ""
  puts "#{D}Looking for files to link to #{GB}#{app_name}#{X} in #{G}#{relative_app_path}#{X}"
  puts ""
  

  # if app_path/ios/Podfile exists, stop and warn the user
  podfile_path = "#{app_path}/macos/Podfile"
  return unless _check_podfile(podfile_path)
  return unless _check_app_path(app_path)

  project = Xcodeproj::Project.open(xcodeproj_path)
  file_group = project[app_name]
  return unless _check_file_group(file_group, app_name, project)

  generated_headers_path = File.join(File.dirname(xcodeproj_path), 'build', 'generated', 'headers')
  generated_headers = Dir.glob(File.join(generated_headers_path, '**/*.h')).map { |file| Pathname.new(file).realpath }

  # if clean is true, remove the Colocated group if it exists
  _clean_colocated_group(file_group, generated_headers_path, project) if clean
  
  # Get all the colocated files
  colocated_files = Dir.glob(File.join(app_path, '**/*.{h,m,mm,c,swift,cpp}')).map { |file| Pathname.new(file).realpath }
  # Add any in the generated headers folder
  colocated_files.concat(generated_headers)

  # get or create the "Colocated" group in xcode
  colocated_group = _get_colocated_group(file_group)
  colocated_group_files = colocated_group.files.map(&:real_path)

  # Remove files from the existing colocated file_group that are not present in the colocated_files array
  _remove_files_from_group(colocated_group, colocated_files, project_root)

  # Add new files to the colocated group
  colocated_files.each do |file|
    _add_file_to_project(file, project, excluded_targets, project_root, colocated_group) unless colocated_group_files.include?(file)
    # Check if there's a header for this file and add it too if not
    if file.extname == '.m' or file.extname == '.mm'
      next if colocated_files.map(&:basename).include?(file.sub_ext('.h').basename)
      generated_header_file = _generate_objc_header(file, xcodeproj_path, generated_headers_path, colocated_files)
      _add_file_to_project(generated_header_file, project, excluded_targets, project_root, colocated_group) if generated_header_file
    end
  end
  _save_project(project)
end

def _save_project(project)
  if not $dirty
    puts ""
    puts "#{D}No changes to Xcode project needed.#{X}"
    puts ""
    return
  end
  project_root = Pathname.new(project.path).parent
  relative_project_path = project.path.relative_path_from(project_root)
  puts ""
  print "#{D}Saving Xcode project #{G}#{relative_project_path}#{X}...#{X}"
  project.save
  puts "#{GB}Done.#{X}"
  puts ""
  $dirty = false
end

def _get_colocated_group(file_group)
  existing_group = file_group['Colocated']
  $dirty = true if existing_group.nil?
  return existing_group || file_group.new_group('Colocated')
end

def _check_podfile(podfile_path)
  return true unless File.exist?(podfile_path)
  puts "React Native Colo Loco error:"
  puts "  Podfile found in #{podfile_path}. We don't support specifying"
  puts "  the macos project root as your app_path."
  puts "  To fix this, change app_path to something like '../app'"
  puts "  (it is currently #{app_path})"
  puts "  Skipping linking of native files."
  puts ""
  return false
end

def _check_app_path(app_path)
  return true if File.exist?(app_path)
  puts "#{RB}React Native Colo Loco error:#{X}"
  puts ""
  puts "#{Y}  No files found in #{GB}#{app_path}#{X}#{Y}."
  puts "#{Y}  Please check your app_path.#{X}"
  puts "#{Y}  Skipping linking of native files.#{X}"
  puts ""
  return false
end

def _check_file_group(file_group, app_name, project)
  return true unless file_group.nil?
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
  return false
end

def _check_file_in_colocated_files(file, colocated_files, project_root)
  return false unless colocated_files.map(&:to_s).include?(file.real_path.to_s)
  relative_path = file.real_path.relative_path_from(project_root)
  puts "#{DB} ✓ Checked    #{X}#{D}#{relative_path.dirname}/#{DB}#{relative_path.basename}#{X}"
  return true
end

def _clean_colocated_group(file_group, generated_headers_path, project)
  $dirty = true

  colocated_group = file_group['Colocated']
  colocated_group.remove_from_project if colocated_group
  
  puts "#{YB} - Removed    #{X}#{S}#{D}Colocated#{X}#{D} group#{X}"

  # Remove all files from the generated headers folder
  FileUtils.rm_rf(generated_headers_path)
  puts "#{YB} - Removed    #{X}#{S}#{D}#{generated_headers_path}#{X}#{D} folder#{X}"

  _save_project(project)
end

def _add_file_to_project(file, project, excluded_targets, project_root, colocated_group)
  $dirty = true
  relative_path = file.relative_path_from(project_root)
  
  # Check if this file specifies any Colo Loco targets
  file_content = File.read(file)
  targets_line = file_content[/colo_loco_targets:(.+)/, 1] # Get the line with the targets, if it exists
  specified_targets = targets_line&.split(',')&.map(&:strip) || []
  
  # Add the new file to all targets (or only the specified targets, if any)
  new_file = colocated_group.new_file(file)
  added_to_targets = []
  project.targets.each do |target|
    # If there are specified_targets, only add this file to the targets in that list;
    # otherwise, use the excluded_list to determine which targets to add this file to
    if specified_targets.any? ? specified_targets.include?(target.name) : !excluded_targets.include?(target.name)
      target.add_file_references([new_file])
      added_to_targets.push(target.name)
    end
  end
  puts "#{GB} + Linked     #{X}#{D}#{relative_path.dirname}/#{GB}#{relative_path.basename}#{X} to #{added_to_targets.join(', ')}"
end

def _remove_files_from_group(colocated_group, colocated_files, project_root)
  colocated_group.files.each do |file|
    _remove_file_from_project(file, project_root) unless _check_file_in_colocated_files(file, colocated_files, project_root)
  end
end

def _remove_file_from_project(file, project_root)
  $dirty = true
  relative_path = file.real_path.relative_path_from(project_root)
  file.remove_from_project
  puts "#{YB} - Removed    #{X}#{S}#{D}#{relative_path.dirname}/#{YB}#{relative_path.basename}#{X}"
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

def _generate_objc_header(objc_file, xcodeproj_path, generated_headers_path, all_linked_files)
  return if objc_file.extname != '.m' and objc_file.extname != '.mm'
  return if objc_file.basename.to_s.include?('ComponentView')
  
  template_header = File.read(File.join(File.dirname(__FILE__), 'templates', 'MyTemplate.h'))

  # Check if there's a header for each .m or .mm file
  # skip header files and other non-.m  .mm files
  file_no_ext = objc_file.basename.sub_ext('')
  header_file = objc_file.sub_ext('.h')
  header_file_path = File.join(generated_headers_path, header_file.basename)
  # Check if the header file exists in the project, and don't generate it
  if all_linked_files.map { |f| f.basename }.include?(header_file.basename)
    puts "#{DB} ✓ Exists     #{X}#{D}#{header_file.basename}#{X}"
  else
    header_file_content = template_header.gsub("MyTemplate", file_no_ext.to_s)
    FileUtils.mkdir_p(File.dirname(header_file_path))
    File.write(header_file_path, header_file_content)
    puts "#{GB} + Generated #{X} #{D}#{header_file}#{X}"
  end
  return Pathname.new(header_file_path)
end
