/*
 ** X2/X3 PDU Format
 ** ETSI TS 103 221-2 V1.4.1 (2021-04)

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

Headers:
    Version: 2 Bytes, Unsigned Integer
    PDU Type: 2 Bytes, Unsigned Integer
        Value Meaning:
            1: X2 PDU (0x0001)
            2: X3 PDU (0x0002)
            3: Keepalive (0x0003)
            4: Keepalive Acknowledgement (0x0004)

    Header Length: 4 Bytes, Unsigned Integer 
    Payload Length: 4 Bytes, Unsigned Integer (Zero for Keepalive and Keepalive Acknowledgement PDUs)
    
    Payload Format: 2 Bytes, Unsigned Integer
        Value Meaning:
            8: RTP Packet
            9: SIP Message

    Payload Direction: 2 Bytes, Unsigned Integer
        Value Meaning:
            0: Reserved for Keepalive mechanism
            1: The direction of the intercepted data or event is not known to the POI
            2: The intercepted data or event was sent to (i.e. received by) the target
            3: The intercepted data or event was sent from the target
            4: The intercepted data or event is a result of intercepted data or events in more than one direction
            5: The concept of direction is not applicable to this intercepted data or event
    
    XID: 16 Bytes, unsigned Integer (UUID)
    Correlation ID: 8 Bytes, unsigned Integer

    Conditional Attribute Fields: Variable, Type-Length-Value (TLV) format
      Attribute Type: Indicates the type of field - 2 bytes unsigned integer
      Attribute Length: Length of the following Attribute Contents - 2 bytes unsigned integer
      Attribute Contents: As defined by the relevant Field Type - Variable

    Payload: Variable 
 */

"use strict";
const { stringify } = require("uuid");

// Lengths in bytes
const pduHeadersMap = {
  version: { length: 2, type: "integer" },
  pduType: { length: 2, type: "integer" },
  headerLength: { length: 4, type: "integer" },
  payloadLength: { length: 4, type: "integer" },
  payloadFormat: { length: 2, type: "integer" },
  payloadDirection: { length: 2, type: "integer" },
  xid: { length: 16, type: "uuid" },
  correlationId: { length: 8, type: "string" },
};

// Conditional Attributes Types
const conditionalAttributesMap = {
  1: { name: "ETSI TS 102 232-1", type: "hex" }, // type is not 3GPP defined
  2: { name: "3GPP TS 33.128", type: "hex" }, // type is not 3GPP defined
  3: { name: "ETSI TS 133 108", type: "hex" }, // type is not 3GPP defined
  4: { name: "Proprietary Attribute", type: "hex" }, // type is not 3GPP defined
  5: { name: "Domain ID (DID)", type: "hex" }, // type is not 3GPP defined
  6: { name: "Network Function ID (NFID)", type: "string" }, // type is not 3GPP defined
  7: { name: "Interception Point ID (IPID)", type: "string" }, // type is not 3GPP defined
  8: { name: "Sequence Number", type: "integer" },
  9: { name: "Timestamp", type: "timestamp" },
  10: { name: "Source IPv4 address", type: "ipv4" },
  11: { name: "Destination IPv4 address", type: "ipv4" },
  12: { name: "Source IPv6 address", type: "ipv6" },
  13: { name: "Destination IPv6 address", type: "ipv6" },
  14: { name: "Source Port", type: "integer" },
  15: { name: "Destination Port", type: "integer" },
  16: { name: "IP Protocol", type: "integer" },
  17: { name: "Matched Target Identifier", type: "string" }, // encoded utf8 string
  18: { name: "Other Target Identifier", type: "string" }, // encoded utf8 string
};

const pduTypesMap = {
  1: "X2",
  2: "X3",
  3: "Keepalive",
  4: "Keepalive Acknowledgement",
};

const payloadTypesMap = {
  0: "Keepalive",
  1: "ETSI TS 102 232-1",
  2: "3GPP TS 33.128",
  3: "ETSI TS 133 108",
  4: "Proprietary Payload",
  5: "IPv4 Packet",
  6: "IPv6 Packet",
  7: "Ethernet Frame",
  8: "RTP Packet",
  9: "SIP Message",
  10: "DHCP Message",
  11: "RADIUS Packet",
  12: "GTP-U Message",
  13: "MSRP Message",
};

const ipProtocolsMap = {
  6: "TCP",
  17: "UDP",
};

const readInteger = (buffer, offset, length) => {
  switch (length) {
    case 1:
      return buffer.readUInt8(offset);
    case 2:
      return buffer.readUInt16BE(offset);
    case 4:
      return buffer.readUInt32BE(offset);
    default:
      throw new Error(`Unsupported integer length: ${length}`);
  }
};

const pduDecoder = (pduHexString) => {
  const hexRegex = /^[0-9A-Fa-f]+$/;
  const metaData = {};
  const result = {
    headers: {},
    conditionalAttributes: [],
    payload: {},
  };
  let offset = 0;

  if (!pduHexString || !hexRegex.test(pduHexString)) {
    throw new Error("Invalid hex string");
  }

  // create a buffer from the hex string
  const pduBuffer = Buffer.from(pduHexString, "hex");

  try {
    // read the mandatory headers
    for (const [key, { length, type }] of Object.entries(pduHeadersMap)) {
      switch (type) {
        case "integer":
          result.headers[key] = readInteger(pduBuffer, offset, length);
          break;
        case "string":
          result.headers[key] = pduBuffer.toString(
            "utf8",
            offset,
            offset + length
          );
          break;
        case "uuid":
          let uuidBytes = pduBuffer.slice(offset, offset + length);
          result.headers[key] = stringify(uuidBytes);
          break;
        default:
          throw new Error(`Unsupported type: ${type}`);
      }

      offset += length;
    }

    // some metadata
    metaData["Mapped Headers Length"] = offset;
    metaData["Conditional Attributes Length"] =
      result.headers?.headerLength - offset;

    // read the conditional attributes/ optional headers
    while (offset < result.headers?.headerLength) {
      const attType = pduBuffer.readUInt16BE(offset);
      offset += 2;
      const attLength = pduBuffer.readUInt16BE(offset);
      offset += 2;

      const { name, type } = conditionalAttributesMap[attType];
      let value;

      switch (type) {
        case "hex":
          value = pduBuffer.slice(offset, offset + attLength).toString("hex");
          break;
        case "integer":
          value = readInteger(pduBuffer, offset, attLength);
          break;
        case "string":
          value = pduBuffer.toString("utf8", offset, offset + attLength);
          break;
        case "timestamp":
          const timeStampBuf = pduBuffer.slice(offset, offset + attLength);
          const seconds = timeStampBuf.readUInt32BE(0);
          const nanoseconds = timeStampBuf.readUInt32BE(4);
          value = seconds + nanoseconds;
          metaData["Timestamp"] = new Date(seconds * 1000);
          break;
        case "ipv4":
          const ipv4Buffer = pduBuffer.slice(offset, offset + attLength);
          value = ipv4Buffer.join(".");
          break;
        case "ipv6":
          const ipv6Buffer = pduBuffer.slice(offset, offset + attLength);
          value = ipv6Buffer
            .toString("hex")
            .match(/.{1,4}/g)
            .join(":");
          break;
        default:
          throw new Error(`Unsupported type: ${type}`);
      }

      result.conditionalAttributes.push({
        attributeType: name,
        length: attLength,
        attributeValue: value,
      });

      offset += attLength;
    }

    // read the payload
    const payload = pduBuffer.slice(
      offset,
      offset + result.headers.payloadLength
    );

    result.payload = payload.toString("hex");

    // make the output human readable / metadata
    metaData["Payload Length"] = result.headers.payloadLength;
    metaData["PDU Type"] = "Unknown";

    if (pduTypesMap[result.headers.pduType]) {
      metaData["PDU Type"] = pduTypesMap[result.headers.pduType];
    }

    metaData["Payload Type"] = "Unknown";

    if (payloadTypesMap[result.headers.payloadFormat]) {
      metaData["Payload Type"] = payloadTypesMap[result.headers.payloadFormat];
    }

    if (result.headers.payloadFormat === 9) {
      metaData["SIP Message String"] = payload.toString("utf8");
    }

    // return the result
    console.log("Decoder MetaData: ", metaData);
    console.log("Decoded PDU: ", result);

    return result;
  } catch (error) {
    console.error("Error in decoding: ", error.message);
  }
};

module.exports = pduDecoder;