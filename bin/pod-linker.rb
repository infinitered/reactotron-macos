# CocoaPods-based React Native Colo Loco
# This version generates files for the IRNativeModules pod instead of directly linking to Xcode
require 'fileutils'
require 'pathname'

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

$changes_made = false

# This method will generate files for the IRNativeModules pod
# instead of directly modifying the Xcode project
def link_colocated_native_files_for_pod(options = {})
  puts "🚀 #{GB}React Native Colo Loco (CocoaPods)#{X}"
  puts ""
  puts "#{D}Running ./bin/pod-linker.rb from #{__FILE__}#{X}"
  puts ""

  _verify_options!(options)

  app_path = options[:app_path]
  project_root = options[:project_root] || Pathname.pwd
  clean = options[:clean] || false
  
  relative_app_path = Pathname.new(app_path).relative_path_from(project_root)
  
  puts "#{D}  App Path: #{GB}#{relative_app_path}#{X}"
  puts "#{D}  Project Root: #{G}#{project_root}#{X}"
  puts "#{D}  clean: #{G}#{clean}#{X}" if clean
  puts ""

  return unless _check_app_path(app_path)

  generated_files_path = File.join(project_root, 'macos', 'build', 'generated', 'colocated')

  # if clean is true, remove the generated files
  if clean
    _clean_generated_files(generated_files_path, project_root)
    return
  end

  # Ensure the generated files directory exists
  FileUtils.mkdir_p(generated_files_path)
  
  # Run the ./generateTurboModule.js script to generate any embedded TurboModules
  _generate_turbomodules(project_root)
  
  # Get all colocated files in the app_path
  colocated_files = Dir.glob(File.join(app_path, '**/*.{h,m,mm,c,swift,cpp}')).map { |file| Pathname.new(file).realpath }
  
  puts "#{D}Processing #{colocated_files.length} native files for CocoaPods#{X}"
  puts ""

  # Generate headers for .mm files that don't have them
  colocated_files.each do |file|
    if file.extname == '.m' || file.extname == '.mm'
      # Check if there's already a header file
      header_file = file.sub_ext('.h')
      next if colocated_files.any? { |f| f.basename == header_file.basename }
      next if file.basename.to_s.include?('ComponentView') # Skip component views
      
      _generate_objc_header(file, generated_files_path, project_root)
    end
  end
  
  # Also generate headers for any .mm files in the generated directory
  generated_mm_files = Dir.glob(File.join(generated_files_path, '*.mm')).map { |file| Pathname.new(file).realpath }
  generated_mm_files.each do |file|
    # Check if header already exists
    header_file = file.sub_ext('.h')
    next if File.exist?(header_file)
    
    _generate_objc_header(file, generated_files_path, project_root)
  end

  if $changes_made
    puts ""
    puts "#{GB}✓ Files generated for IRNativeModules pod#{X}"
    puts "#{D}  Run 'pod install' to link the updated files to Xcode#{X}"
    puts ""
  else
    puts ""
    puts "#{D}No changes needed.#{X}"
    puts ""
  end
end

def _verify_options!(options)
  if options[:app_path].nil?
    raise "#{RB}link_colocated_native_files_for_pod - You must specify an app_path#{X}"
  end
end

def _check_app_path(app_path)
  return true if File.exist?(app_path)
  puts "#{RB}React Native Colo Loco error:#{X}"
  puts ""
  puts "#{Y}  No files found in #{GB}#{app_path}#{X}#{Y}.#{X}"
  puts "#{Y}  Please check your app_path.#{X}"
  puts ""
  return false
end

def _clean_generated_files(generated_files_path, project_root)
  $changes_made = true
  relative_path = Pathname.new(generated_files_path).relative_path_from(project_root)
  
  if File.exist?(generated_files_path)
    FileUtils.rm_rf(generated_files_path)
    puts "#{YB} - Removed    #{X}#{S}#{D}#{relative_path}#{X}#{D} folder#{X}"
  end
  
  puts ""
  puts "#{GB}✓ Generated files cleaned#{X}"
  puts ""
end

def _generate_objc_header(objc_file, generated_files_path, project_root)
  return if objc_file.extname != '.m' && objc_file.extname != '.mm'
  
  template_header = File.read(File.join(File.dirname(__FILE__), 'templates', 'MyTemplate.h'))

  file_no_ext = objc_file.basename.sub_ext('')
  header_file_path = File.join(generated_files_path, "#{file_no_ext}.h")
  
  # Don't regenerate if file exists and is newer than source
  if File.exist?(header_file_path) && File.mtime(header_file_path) > File.mtime(objc_file)
    relative_header = Pathname.new(header_file_path).relative_path_from(project_root)
    puts "#{DB} ✓ Up-to-date #{X}#{D}#{relative_header}#{X}"
    return
  end

  header_file_content = template_header.gsub("MyTemplate", file_no_ext.to_s)
  FileUtils.mkdir_p(File.dirname(header_file_path))
  File.write(header_file_path, header_file_content)
  
  relative_header = Pathname.new(header_file_path).relative_path_from(project_root)
  puts "#{GB} + Generated  #{X}#{D}#{relative_header}#{X}"
  $changes_made = true
  
  return Pathname.new(header_file_path)
end

def _generate_turbomodules(project_root)
  puts "#{D}Generating embedded TurboModules#{X}"
  puts ""
  result = `node #{project_root}/bin/generateTurboModule.js generate 2>&1`
  puts result
  puts ""
  $changes_made = true if result.include?("Generated") || result.include?("processed")
end