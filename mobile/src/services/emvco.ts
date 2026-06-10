export interface PromptPayQRData {
  isValid: boolean;
  merchantName?: string;
  proxyType?: 'PHONE' | 'TAX_ID' | 'BILLER_ID' | 'UNKNOWN';
  proxyValue?: string;
  amount?: number;
  currency: string;
}

export class EmvcoDecoder {
  /**
   * Parses standard Thai PromptPay EMVCo QR code payload strings.
   * Format uses nested [Tag (2 digits)][Length (2 digits)][Value] patterns.
   */
  public static decode(payload: string): PromptPayQRData {
    const result: PromptPayQRData = {
      isValid: false,
      currency: 'THB', // Default system target
    };

    try {
      // 1. Basic sanity check for EMVCo specification compliance
      if (!payload.startsWith('000201')) {
        return result;
      }

      let index = 0;
      while (index < payload.length) {
        // Tag is always 2 characters long
        const tag = payload.substring(index, index + 2);
        // Length field is always 2 characters long
        const lengthStr = payload.substring(index + 2, index + 4);
        const length = parseInt(lengthStr, 10);

        if (isNaN(length)) break;

        // Extract value based on the read length attribute
        const value = payload.substring(index + 4, index + 4 + length);
        
        // Move reader pointer forward to next tag start block
        index += 4 + length;

        // 2. Map standard root EMVCo payload identifier tags
        switch (tag) {
          case '29': // Merchant Account Information (Thai PromptPay Root Template Data)
            this.parseMerchantInfo(value, result);
            break;
          case '54': // Transaction Amount
            result.amount = parseFloat(value);
            break;
          case '53': // Transaction Currency (ISO 4217 numeric codes)
            if (value === '764') result.currency = 'THB';
            break;
          case '59': // Merchant Name
            result.merchantName = value;
            break;
        }
      }

      // Valid if we safely discovered the merchant routing configuration profile
      if (result.proxyValue) {
        result.isValid = true;
      }
    } catch (error) {
      console.error('Failed to parse EMVCo QR string payload matrix:', error);
      result.isValid = false;
    }

    return result;
  }

  /**
   * Helper function to extract sub-tags hidden within the primary PromptPay network tag (29)
   */
  private static parseMerchantInfo(subPayload: string, result: PromptPayQRData): void {
    let index = 0;
    while (index < subPayload.length) {
      const tag = subPayload.substring(index, index + 2);
      const length = parseInt(subPayload.substring(index + 2, index + 4), 10);
      if (isNaN(length)) break;

      const value = subPayload.substring(index + 4, index + 4 + length);
      index += 4 + length;

      // Thai PromptPay standard ID markers
      if (tag === '01') {
        if (value.length === 13 && value.startsWith('00')) {
          result.proxyType = 'PHONE';
          // Convert internal layout tracking into clear format (+66)
          result.proxyValue = `+66${value.substring(3)}`;
        } else if (value.length === 13) {
          result.proxyType = 'TAX_ID';
          result.proxyValue = value;
        } else if (value.length === 15) {
          result.proxyType = 'BILLER_ID';
          result.proxyValue = value;
        } else {
          result.proxyType = 'UNKNOWN';
          result.proxyValue = value;
        }
      }
    }
  }
}
