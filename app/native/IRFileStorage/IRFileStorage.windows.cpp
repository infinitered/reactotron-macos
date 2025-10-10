#include "pch.h"
#include "IRFileStorage.windows.h"
#include <filesystem>
#include <fstream>

namespace fs = std::filesystem;

namespace winrt::reactotron::implementation {

  static void ensure_dir_exists(const std::string &path) {
    if (path.empty()) return;
    std::error_code ec;
    fs::create_directories(fs::path(path), ec);
  }

  std::string IRFileStorage::read(std::string path) noexcept {
    try {
      std::ifstream file(path, std::ios::in | std::ios::binary);
      if (!file.is_open()) return std::string();
      std::string contents;
      file.seekg(0, std::ios::end);
      contents.resize(static_cast<size_t>(file.tellg()));
      file.seekg(0, std::ios::beg);
      file.read(contents.data(), static_cast<std::streamsize>(contents.size()));
      return contents;
    } catch (...) {
      return std::string();
    }
  }

  void IRFileStorage::write(std::string path, std::string data) noexcept {
    try {
      ensure_dir_exists(fs::path(path).parent_path().string());
      std::ofstream file(path, std::ios::out | std::ios::binary | std::ios::trunc);
      if (!file.is_open()) return;
      file.write(data.data(), static_cast<std::streamsize>(data.size()));
    } catch (...) {
    }
  }

  void IRFileStorage::remove(std::string path) noexcept {
    try {
      std::error_code ec;
      fs::remove(fs::path(path), ec);
    } catch (...) {
    }
  }

  void IRFileStorage::ensureDir(std::string path) noexcept {
    ensure_dir_exists(path);
  }

}


