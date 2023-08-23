# x2x3PduDecoder

### Deciphering X2/X3 Lawful Interception PDUs

Unveil the intricacies of the X2/X3 PDU Format with this Node.js decoder. This tool brings clarity to the protocol's complex structure, allowing you to easily interpret and analyze captured network packets.

#### X2/X3 PDU Format (ETSI TS 103 221-2 V1.4.1 - April 2021)

The X2/X3 PDU Format lies at the heart of lawful interception, offering insights into communication networks. Dive into the protocol's anatomy and explore its fields:

<pre>

 0                   1                   2                   3 
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|           Version             |           PDU Type  
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                           Header Length
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                           Payload Length
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|        Payload Format         |     Payload Direction
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                       
|
|                               XID
|
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                           Correlation ID
|    
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|        Conditional Attribute Fields (Variable Length)            
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                     Payload (Variable Length)                
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

</pre>


**Headers:**

- **Version:** 2 Bytes, Unsigned Integer
- **PDU Type:** 2 Bytes, Unsigned Integer
  - Values:
    - 1: X2 PDU
    - 2: X3 PDU
    - 3: Keepalive
    - 4: Keepalive Acknowledgement

- **Header Length:** 4 Bytes, Unsigned Integer 
- **Payload Length:** 4 Bytes, Unsigned Integer (Zero for Keepalive and Keepalive Acknowledgement PDUs)
    
- **Payload Format:** 2 Bytes, Unsigned Integer
  - Values:
    - 8: RTP Packet
    - 9: SIP Message

- **Payload Direction:** 2 Bytes, Unsigned Integer
  - Values:
    - 0: Reserved for Keepalive mechanism
    - 1: Direction unknown to the POI
    - 2: Sent to the target
    - 3: Sent from the target
    - 4: Result of data/events in multiple directions
    - 5: Direction concept not applicable

- **XID:** 16 Bytes, Unsigned Integer (UUID)
- **Correlation ID:** 8 Bytes, Unsigned Integer

- **Conditional Attribute Fields:** Variable, Type-Length-Value (TLV) format
  - **Attribute Type:** 2 bytes unsigned integer
  - **Attribute Length:** 2 bytes unsigned integer
  - **Attribute Contents:** Variable, as defined by the relevant Field Type

- **Payload:** Variable

#### Unlocking Insights

Empower your network analysis with the x2x3PduDecoder:

- **Enhanced Understanding:** Decode complex PDUs effortlessly, gaining deep insights into each field's semantic meaning.
- **SIP and RTP Interpretation:** Seamlessly interpret SIP messages and RTP packets, shedding light on multimedia and communication traffic.

#### Getting Started

1. Clone this repository.
2. Install dependencies using `npm install`.
3. Run the decoder with your captured packets's hex string.

#### Collaborate and Contribute

Join us in advancing network analysis tools. Your insights and contributions are valuable in refining this decoder and ensuring its accuracy.

For any inquiries or feedback, reach out to [Hossein Yavari](mailto:hyavari26@gmail.com).
