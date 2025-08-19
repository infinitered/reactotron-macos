#!/usr/bin/env ruby

# ONE-TIME MIGRATION SCRIPT - Already executed successfully!
# 
# This script cleaned up old native module references from the main Xcode project
# during the migration from direct project manipulation to CocoaPods-based approach.
#
# ⚠️  DO NOT RUN THIS AGAIN unless you know what you're doing!
#
# Historical context: The old bin/linker.rb directly added files to the Xcode project,
# causing .pbxproj conflicts. The new approach uses CocoaPods (IRNativeModules pod)
# to manage dependencies cleanly.

require 'xcodeproj'

project_path = 'macos/Reactotron.xcodeproj'
project = Xcodeproj::Project.open(project_path)

# Find the main target
target = project.targets.find { |t| t.name == 'Reactotron-macOS' }

if target.nil?
  puts "Target 'Reactotron-macOS' not found!"
  exit 1
end

# List of native modules to remove (these are now provided by IRNativeModules pod)
modules_to_remove = [
  'IRClipboard',
  'IRContextMenuManager',
  'IRExperimental',
  'IRFontList',
  'IRKeyboard',
  'IRMenuItemManager',
  'IRRandom',
  'IRRunShellCommand',
  'IRSystemInfo',
  'IRTabComponentView'
]

puts "Cleaning up old native module references from Xcode project..."

# Remove source files from target
files_to_remove = []
target.source_build_phase.files.each do |build_file|
  file_ref = build_file.file_ref
  next unless file_ref
  
  modules_to_remove.each do |module_name|
    if file_ref.path && file_ref.path.include?(module_name)
      puts "  Removing source file: #{file_ref.path}"
      files_to_remove << build_file
      break
    end
  end
end

files_to_remove.each do |build_file|
  target.source_build_phase.files.delete(build_file)
end

# Remove header files from target
headers_to_remove = []
target.headers_build_phase&.files&.each do |build_file|
  file_ref = build_file.file_ref
  next unless file_ref
  
  modules_to_remove.each do |module_name|
    if file_ref.path && file_ref.path.include?(module_name)
      puts "  Removing header file: #{file_ref.path}"
      headers_to_remove << build_file
      break
    end
  end
end

headers_to_remove.each do |build_file|
  target.headers_build_phase.files.delete(build_file)
end

# Remove file references from project
refs_to_remove = []
project.main_group.recursive_children.each do |item|
  next unless item.is_a?(Xcodeproj::Project::Object::PBXFileReference)
  
  modules_to_remove.each do |module_name|
    if item.path && item.path.include?(module_name)
      puts "  Removing file reference: #{item.path}"
      refs_to_remove << item
      break
    end
  end
end

refs_to_remove.each do |ref|
  ref.remove_from_project
end

puts "Saving project..."
project.save

puts "✓ Cleanup complete! Old native module references removed from Xcode project."