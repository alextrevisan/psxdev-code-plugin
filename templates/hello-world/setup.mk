# PSn00bSDK setup file
# This file will be automatically updated by the extension with the correct paths
# Do not modify the $(PS1SDK_PATH), $(GCC_PATH) and $(EMULATOR_PATH) variables

# Paths - The extension will replace these variables with the correct paths
PREFIX = mipsel-none-elf-
PSN00B_BASE = $(PLUGIN_SDK_PATH)

PSN00B_LIB = $(PSN00B_BASE)/lib/libpsn00b
PSN00B_INCLUDE = $(PSN00B_BASE)/include/libpsn00b
GCC_BASE = $(GCC_PATH)

LIBDIRS = -L$(PSN00B_LIB)/release
INCLUDE = -I$(PSN00B_INCLUDE)

ELF2X = $(PSN00B_BASE)/bin/elf2x
MKPSXISO = $(PSN00B_BASE)/bin/mkpsxiso
EMULATOR_DIR = $(EMULATOR_PATH)

GCC_BIN = $(GCC_BASE)/bin/

CC = $(GCC_BIN)$(PREFIX)gcc
CXX = $(GCC_BIN)$(PREFIX)g++
AS = $(GCC_BIN)$(PREFIX)as
AR = $(GCC_BIN)$(PREFIX)ar
RANLIB = $(GCC_BIN)$(PREFIX)ranlib
LD = $(GCC_BIN)$(PREFIX)ld

# Folders - Directories for output files
MKPSXISO_XML = cd.xml
BIN_FOLDER = bin
ISO_FOLDER = iso
