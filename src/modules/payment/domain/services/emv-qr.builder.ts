/**
 * EMV QR Code Builder for BCEL OnePay
 *
 * Implements EMVCo QR Code Specification (MPM — Merchant Presented Mode)
 * Format: TLV string (Tag-Length-Value) with CRC16-CCITT checksum
 *
 * Ref: PAYMENT.md — Section 4. EMV QR Code
 */

// ─── CRC16-CCITT ─────────────────────────────────────────────────────────────

/** CRC16-CCITT with polynomial 0x1021, initial value 0xFFFF */
function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    const byte = data.charCodeAt(i);
    crc ^= byte << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  // Must be exactly 4 hex chars (pad with leading zeros)
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

// ─── TLV helpers ─────────────────────────────────────────────────────────────

/** Build a single TLV field: "TTLL{value}" where LL is zero-padded length */
function tlv(tag: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${tag}${len}${value}`;
}

/** Build nested TLV (sub-tag inside a parent field) */
function tlvNested(tag: string, subTags: string[]): string {
  const inner = subTags.join("");
  return tlv(tag, inner);
}

// ─── OnePay QR Builder ────────────────────────────────────────────────────────

export interface BuildQrOptions {
  mcid: string; // Merchant ID (ONEPAY_MCID)
  shopCode: string; // Shop code (ONEPAY_SHOPCODE)
  mcc: string; // Merchant Category Code (default: 5411)
  terminalId: string; // Terminal ID (default: T001)
  amount: number; // Amount in LAK (integer)
  txnRef: string; // Our unique transaction reference (stored in PubNub uuid)
  orderId: string; // Order ID (invoice ref, field 62.01)
}

/**
 * Build EMV QR string for BCEL OnePay
 * Returns the full TLV string with CRC16 appended
 */
export function buildOnepayQr(opts: BuildQrOptions): string {
  const fields: string[] = [];

  // 00: Payload Format Indicator (always "01")
  fields.push(tlv("00", "01"));

  // 01: Point of Initiation — "12" = dynamic QR (unique per transaction)
  fields.push(tlv("01", "12"));

  // 33: Merchant Account Information (OnePay specific)
  const merchantInfo = [
    tlv("00", "BCEL"),
    tlv("01", "ONEPAY"),
    tlv("02", opts.mcid),
    tlv("05", "CLOSEWHENDONE"),
  ];
  fields.push(tlvNested("33", merchantInfo));

  // 52: Merchant Category Code
  fields.push(tlv("52", opts.mcc));

  // 53: Transaction Currency — 418 = LAK
  fields.push(tlv("53", "418"));

  // 54: Transaction Amount (integer, no decimal for LAK)
  fields.push(tlv("54", String(Math.round(opts.amount))));

  // 58: Country Code
  fields.push(tlv("58", "LA"));

  // 60: Merchant City (Province)
  fields.push(tlv("60", "VTE"));

  // 62: Additional Data Field Template
  const additionalData = [
    tlv("01", opts.orderId), // 62.01: Invoice / Order ID
    tlv("05", opts.txnRef), // 62.05: txnRef — MUST match PubNub message "uuid"
    tlv("07", opts.terminalId), // 62.07: Terminal ID
  ];
  fields.push(tlvNested("62", additionalData));

  // 63: CRC — placeholder "6304" then compute over everything + "6304"
  const payload = fields.join("") + "6304";
  const crc = crc16(payload);

  return payload + crc;
}
