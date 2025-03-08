include setup.mk

# Project target name
TARGET = hello_world

# Emulator configuration
# The extension will automatically replace $(EMULATOR_DIR) with the correct path to the emulator
# Uncomment the appropriate configuration for your system or add a custom one

# PCSX-Redux (macOS)
EMUBIN = $(EMULATOR_DIR)/PCSX-Redux.app/Contents/MacOS/pcsx-redux
EMU_CMD = $(EMUBIN) -iso iso/$(TARGET).cue

# DuckStation (macOS)
#EMUBIN = $(EMULATOR_DIR)/DuckStation.app/Contents/MacOS/DuckStation
#EMU_CMD = $(EMUBIN) -fastboot iso/$(TARGET).cue

# DuckStation (Windows)
#EMUBIN = $(EMULATOR_DIR)/duckstation.exe
#EMU_CMD = $(EMUBIN) -fastboot iso/$(TARGET).cue

# RetroArch (Windows)
#EMUBIN = $(EMULATOR_DIR)/retroarch.exe
#EMU_CMD = $(EMUBIN) -L swanstation_libretro.dll iso/$(TARGET).cue

# PCSX-Redux (Windows)
#EMUBIN = $(EMULATOR_DIR)/pcsx-redux.exe
#EMU_CMD = $(EMUBIN) -iso iso/$(TARGET).cue

# Searches for C, C++ and S (assembler) files in local directory
CFILES		= $(notdir $(wildcard *.c))
CPPFILES 	= $(notdir $(wildcard *.cpp))
AFILES		= $(notdir $(wildcard *.s))

# Object files
OBJS		= $(addprefix build/,$(CFILES:.c=.o)) \
			$(addprefix build/,$(CPPFILES:.cpp=.o)) \
			$(addprefix build/,$(AFILES:.s=.o)) 

# Project specific include and library directories
INCLUDE	 	+= -I. -I$(GCC_BASE)/include -I$(PSN00B_INCLUDE)
LIBDIRS		+= -L$(PSN00B_LIB)

# Libraries to link
LIBS		= -lpsxgpu_exe_nogprel -lpsxgte_exe_nogprel -lpsxspu_exe_nogprel -lpsxetc_exe_nogprel -lpsxapi_exe_nogprel -lc_exe_nogprel

# C compiler flags
CFLAGS		= -Wa,--strip-local-absolute \
			  -ffreestanding \
			  -fno-builtin \
			  -nostdlib \
			  -fdata-sections \
			  -ffunction-sections \
			  -fsigned-char \
			  -fno-strict-overflow \
			  -fdiagnostics-color=always \
			  -msoft-float \
			  -march=r3000 \
			  -mtune=r3000 \
			  -mabi=32 \
			  -mno-mt \
			  -mno-llsc \
			  -G8 \
			  -fno-pic \
			  -mno-abicalls \
			  -mgpopt \
			  -mno-extern-sdata \
			  -msoft-float \
			  -O3

# C++ compiler flags
CPPFLAGS	= $(CFLAGS) -fno-exceptions \
						-fno-rtti \
						-fno-unwind-tables \
						-fno-threadsafe-statics \
						-fno-use-cxa-atexit \
						-Wno-narrowing \
						-fconcepts \
						-std=c++20
						
# Assembler flags
AFLAGS		= -msoft-float

# Linker flags
LDFLAGS		= -g -Ttext=0x80010000 -gc-sections \
                        -T $(PSN00B_LIB)/ldscripts/exe.ld

all: $(OBJS)
	@mkdir -p $(BIN_FOLDER)
	$(LD) $(LDFLAGS) $(LIBDIRS) $(OBJS) $(LIBS) -o bin/$(TARGET)
	$(ELF2X) -q $(BIN_FOLDER)/$(TARGET) $(BIN_FOLDER)/$(TARGET).exe
	$(ELF2X) -q $(BIN_FOLDER)/$(TARGET) $(BIN_FOLDER)/$(TARGET).elf

iso: all
	@mkdir -p $(ISO_FOLDER)
	@rm -rf $(ISO_FOLDER)/*.cue $(ISO_FOLDER)/*.bin
	@$(MKPSXISO) $(MKPSXISO_XML)
	@mv *.cue $(ISO_FOLDER)
	@mv *.bin $(ISO_FOLDER)

run: iso
	$(EMU_CMD)

build/%.o: %.c
	@mkdir -p $(dir $@)
	$(CXX) $(CFLAGS) $(INCLUDE) -c $< -o $@
	
build/%.o: %.cpp
	@mkdir -p $(dir $@)
	$(CXX) $(CPPFLAGS) $(INCLUDE) -c $< -o $@

build/%.o: %.s
	@mkdir -p $(dir $@)
	$(CXX) $(AFLAGS) $(INCLUDE) -c $< -o $@

clean:
	rm -rf build $(BIN_FOLDER) $(ISO_FOLDER) *.bin *.cue
