if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "/Users/blackgoat/.gradle/caches/8.12/transforms/a5fe47236b5401853ffdb5a60bc2dbbc/transformed/hermes-android-0.78.3-debug/prefab/modules/libhermes/libs/android.x86/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/blackgoat/.gradle/caches/8.12/transforms/a5fe47236b5401853ffdb5a60bc2dbbc/transformed/hermes-android-0.78.3-debug/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

