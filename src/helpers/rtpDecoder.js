exports.rtp_packet_decoder = (packet_hex_string) => {
  const decoded_packet = {};

  const first_byte = parseInt(packet_hex_string.substring(0, 2), 16);
  decoded_packet["Version"] = (first_byte >> 6) & 0x03; // Version is the first 2 bits
  decoded_packet["Padding"] = (first_byte >> 4) & 0x01; // Padding is the next 1 bit
  decoded_packet["Extension"] = (first_byte >> 3) & 0x01; // Extension is the next 1 bit
  decoded_packet["CSI_Count"] = first_byte & 0x0f; // Contributing Source Identifiers Count is the last 4 bits

  const second_byte = parseInt(packet_hex_string.substring(2, 4), 16);
  decoded_packet["Marker"] = (second_byte >> 7) & 0x01; // Marker is the next 1 bit
  decoded_packet["Payload_Type"] = second_byte & 0x7f; // Payload Type is the last 7 bits

  decoded_packet["Sequence_Number"] = parseInt(
    packet_hex_string.substring(4, 8),
    16
  ); // 2 bytes
  decoded_packet["Timestamp"] = parseInt(
    packet_hex_string.substring(8, 16),
    16
  ); // 4 bytes
  decoded_packet["SSRC"] = parseInt(packet_hex_string.substring(16, 24), 16); // 4 bytes
  decoded_packet["Payload_Hex"] = packet_hex_string.substring(24); // Payload is the rest of the packet

  return decoded_packet;
};
