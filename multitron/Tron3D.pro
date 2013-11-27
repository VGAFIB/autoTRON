TEMPLATE = app
CONFIG += console
CONFIG -= app_bundle
CONFIG -= qt

SOURCES += \
    Utils.cc \
    Action.cc \
    AIDemo.cc \
    AIMegakiwi.cc \
    AINull.cc \
    BackTrace.cc \
    Board.cc \
    Game.cc \
    Main.cc \
    Player.cc \
    Registry.cc \
    AITorraTorra.cc

HEADERS += \
    Action.hh \
    BackTrace.hh \
    Board.hh \
    Game.hh \
    Player.hh \
    Registry.hh \
    Utils.hh

OTHER_FILES += \
    run.sh \
    Makefile

