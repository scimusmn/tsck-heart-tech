#ifndef SMM_RFID_CARD_H
#define SMM_RFID_CARD_H

#include <SoftwareSerial.h>

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

struct Card
{
    unsigned char id[5];

    String getId()
    {
        char buf[15];
        snprintf(buf, 15*sizeof(char),
                 "%02x %02x %02x %02x %02x",
                 id[0], id[1], id[2], id[3], id[4]);
        return String(buf);
    }

    inline bool operator==(const Card& a)
    {
	if (a.id[0] != id[0])
	    return false;
	if (a.id[1] != id[1])
	    return false;
	if (a.id[2] != id[2])
	    return false;
	if (a.id[3] != id[3])
	    return false;
	if (a.id[4] != id[4])
	    return false;
	return true;
    }
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

class ID12LA
{
public:
    enum Status {
        READING,
        READ_OK,
        READ_BAD };

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    void setup(int rxPin)
    {
	serial = new SoftwareSerial(rxPin, 13);
	serial->begin(9600);
    }

    ~ID12LA() { delete serial; }

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    void update()
    {
	serial->listen();

	while (serial->available())
	    addChar(serial->read());
    }

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    void clear()
    {
        memset(buffer,  0, 3*sizeof(char));
        memset(card.id, 0, 5*sizeof(unsigned char));
        checksum = 0;

        id_index = 0;
        buffer_index = 0;

        status = READING;
    }

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    Card getCard() { return card; }

    enum Status getStatus() { return status; }

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

private:
    Card card;
    char buffer[3];
    unsigned char checksum;

    SoftwareSerial* serial;
    
    unsigned int id_index;
    unsigned int buffer_index;
    enum Status status;

    void addChar(char c)
    {
        if (buffer_index < 2) {
            buffer[buffer_index] = c;
            buffer_index++;
        }
        if (buffer_index == 2) {
            buffer_index = 0;
            processBuffer();
        }
    }

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    void processBuffer()
    {
        unsigned long int n = strtoul(buffer, NULL, 16);
        if (id_index < 5) {
            card.id[id_index] = (unsigned char) (n & 0xff);
            id_index++;
        }
        else {
            checksum = n;
            checkId();
            id_index = 0;
        }
    }

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    void checkId()
    {
        unsigned char sum = 0;
        for (int i=0; i<5; i++)
            sum = sum ^ card.id[i];

        if (sum == checksum)
            status = READ_OK;
        else
            status = READ_BAD;
    }
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

#endif
