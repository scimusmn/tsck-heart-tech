#include <arduino.h>
#include <Wire.h>

#include "SerialController.hpp"
#include "Button.h"
#include "ID12LA.h"

#define BAUD_RATE 9600
#define BUTTON_PIN 2
#define READER_ADDRESS 0x70


void buttonPress(int);

SerialController serial;
Card card;
Button button(BUTTON_PIN, buttonPress);

void onParse(char* message, char* value) {}

void buttonPress(int released) {
    if (!released) {
        serial.sendMessage("button", 1);
    }
}

void readCard(int address, Card& card) {
    bool newCard = false;
    
    Wire.requestFrom(address, 5);
    for (int i=0; i<5; i++) {
        card.id[i] = Wire.read();
        newCard = newCard || card.id[i];
    }

    if (newCard)
        onRead(card);
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

void onRead(Card& card) {
    serial.sendMessage("card", (char*) card.getId().c_str());
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

void setup() {
    serial.setup(BAUD_RATE, onParse);
    Wire.begin();
}

void loop() {
    serial.update();
    button.update();

    readCard(READER_ADDRESS, card);
}
