/**
 * @packageDocumentation
 * @module QuoteUtils
 */

import type {
  CompressedCostBreakdown,
  CompressedQuote,
  CompressedQuoteAgreed,
  CompressedQuoteAttesterSigned,
  ICostBreakdown,
  IQuote,
  IQuoteAgreement,
  IQuoteAttesterSigned,
} from '@kiltprotocol/types'
import { SDKErrors } from '@kiltprotocol/utils'

/**
 *  Compresses the cost from a [[Quote]] object.
 *
 * @param cost A cost object that will be sorted and stripped into a [[Quote]].
 * @throws [[ERROR_COMPRESS_OBJECT]] when cost is missing any property defined in [[ICostBreakdown]].
 *
 * @returns An ordered array of a cost.
 */

export function compressCost(cost: ICostBreakdown): CompressedCostBreakdown {
  if (!cost.gross || !cost.net || !cost.tax) {
    throw SDKErrors.ERROR_COMPRESS_OBJECT(cost, 'Cost Breakdown')
  }
  return [cost.gross, cost.net, cost.tax]
}

/**
 *  Decompresses the cost from storage and/or message.
 *
 * @param cost A compressed cost array that is reverted back into an object.
 * @throws [[ERROR_DECOMPRESSION_ARRAY]] when cost is not an Array and it's length does not equal the defined length of 3.
 *
 * @returns An object that has the same properties as a cost.
 */

export function decompressCost(cost: CompressedCostBreakdown): ICostBreakdown {
  if (!Array.isArray(cost) || cost.length !== 3) {
    throw SDKErrors.ERROR_DECOMPRESSION_ARRAY('Cost Breakdown')
  }
  return { gross: cost[0], net: cost[1], tax: cost[2] }
}

/**
 *  Compresses a [[Quote]] for storage and/or messaging.
 *
 * @param quote An [[Quote]] object that will be sorted and stripped for messaging or storage.
 * @throws [[ERROR_COMPRESS_OBJECT]] when quote is missing any property defined in [[IQuote]].
 *
 * @returns An ordered array of an [[Quote]].
 */

export function compressQuote(quote: IQuote): CompressedQuote {
  if (
    !quote.attesterAddress ||
    !quote.cTypeHash ||
    !quote.cost ||
    !quote.currency ||
    !quote.termsAndConditions ||
    !quote.timeframe
  ) {
    throw SDKErrors.ERROR_COMPRESS_OBJECT(quote, 'Quote')
  }
  return [
    quote.attesterAddress,
    quote.cTypeHash,
    compressCost(quote.cost),
    quote.currency,
    quote.termsAndConditions,
    quote.timeframe,
  ]
}

/**
 *  Decompresses an [[Quote]] from storage and/or message.
 *
 * @param quote A compressed [[Quote]] array that is reverted back into an object.
 * @throws [[ERROR_DECOMPRESSION_ARRAY]] when quote is not an Array and it's length does not equal the defined length of 6.
 * @returns An object that has the same properties as an [[Quote]].
 */

export function decompressQuote(quote: CompressedQuote): IQuote {
  if (!Array.isArray(quote) || quote.length !== 6) {
    throw SDKErrors.ERROR_DECOMPRESSION_ARRAY()
  }
  return {
    attesterAddress: quote[0],
    cTypeHash: quote[1],
    cost: decompressCost(quote[2]),
    currency: quote[3],
    termsAndConditions: quote[4],
    timeframe: quote[5],
  }
}

/**
 *  Compresses an attester signed [[Quote]] for storage and/or messaging.
 *
 * @param attesterSignedQuote An attester signed [[Quote]] object that will be sorted and stripped for messaging or storage.
 * @throws [[ERROR_COMPRESS_OBJECT]] when attesterSignedQuote is missing any property defined in [[IQuoteAttesterSigned]].
 *
 * @returns An ordered array of an attester signed [[Quote]].
 */

export function compressAttesterSignedQuote(
  attesterSignedQuote: IQuoteAttesterSigned
): CompressedQuoteAttesterSigned {
  if (
    !attesterSignedQuote.attesterAddress ||
    !attesterSignedQuote.cTypeHash ||
    !attesterSignedQuote.cost ||
    !attesterSignedQuote.currency ||
    !attesterSignedQuote.termsAndConditions ||
    !attesterSignedQuote.timeframe ||
    !attesterSignedQuote.attesterSignature
  ) {
    throw SDKErrors.ERROR_COMPRESS_OBJECT(
      attesterSignedQuote,
      'Attester Signed Quote'
    )
  }
  return [
    attesterSignedQuote.attesterAddress,
    attesterSignedQuote.cTypeHash,
    compressCost(attesterSignedQuote.cost),
    attesterSignedQuote.currency,
    attesterSignedQuote.termsAndConditions,
    attesterSignedQuote.timeframe,
    attesterSignedQuote.attesterSignature,
  ]
}

/**
 *  Decompresses an attester signed [[Quote]] from storage and/or message.
 *
 * @param attesterSignedQuote A compressed attester signed [[Quote]] array that is reverted back into an object.
 * @throws [[ERROR_DECOMPRESSION_ARRAY]] when attesterSignedQuote is not an Array and it's length does not equal the defined length of 7.
 *
 * @returns An object that has the same properties as an attester signed [[Quote]].
 */

export function decompressAttesterSignedQuote(
  attesterSignedQuote: CompressedQuoteAttesterSigned
): IQuoteAttesterSigned {
  if (!Array.isArray(attesterSignedQuote) || attesterSignedQuote.length !== 7) {
    throw SDKErrors.ERROR_DECOMPRESSION_ARRAY()
  }
  return {
    attesterAddress: attesterSignedQuote[0],
    cTypeHash: attesterSignedQuote[1],
    cost: decompressCost(attesterSignedQuote[2]),
    currency: attesterSignedQuote[3],
    termsAndConditions: attesterSignedQuote[4],
    timeframe: attesterSignedQuote[5],
    attesterSignature: attesterSignedQuote[6],
  }
}

/**
 *  Compresses a [[Quote]] Agreement for storage and/or messaging.
 *
 * @param quoteAgreement A [[Quote]] Agreement object that will be sorted and stripped for messaging or storage.
 * @throws [[ERROR_COMPRESS_OBJECT]] when quoteAgreement is missing any property defined in [[IQuoteAgreement]].
 *
 * @returns An ordered array of a [[Quote]] Agreement.
 */

export function compressQuoteAgreement(
  quoteAgreement: IQuoteAgreement
): CompressedQuoteAgreed {
  if (
    !quoteAgreement.attesterAddress ||
    !quoteAgreement.cTypeHash ||
    !quoteAgreement.cost ||
    !quoteAgreement.currency ||
    !quoteAgreement.termsAndConditions ||
    !quoteAgreement.timeframe ||
    !quoteAgreement.attesterSignature
  ) {
    throw SDKErrors.ERROR_COMPRESS_OBJECT(quoteAgreement, 'Quote Agreement')
  }
  return [
    quoteAgreement.attesterAddress,
    quoteAgreement.cTypeHash,
    compressCost(quoteAgreement.cost),
    quoteAgreement.currency,
    quoteAgreement.termsAndConditions,
    quoteAgreement.timeframe,
    quoteAgreement.attesterSignature,
    quoteAgreement.claimerSignature,
    quoteAgreement.rootHash,
  ]
}

/**
 *  Decompresses a [[Quote]] Agreement from storage and/or message.
 *
 * @param quoteAgreement A compressed [[Quote]] Agreement array that is reverted back into an object.
 * @throws [[ERROR_DECOMPRESSION_ARRAY]] when quoteAgreement is not an Array and it's length does not equal the defined length of 9.
 *
 * @returns An object that has the same properties as a [[Quote]] Agreement.
 */

export function decompressQuoteAgreement(
  quoteAgreement: CompressedQuoteAgreed
): IQuoteAgreement {
  if (!Array.isArray(quoteAgreement) || quoteAgreement.length !== 9) {
    throw SDKErrors.ERROR_DECOMPRESSION_ARRAY()
  }
  return {
    attesterAddress: quoteAgreement[0],
    cTypeHash: quoteAgreement[1],
    cost: decompressCost(quoteAgreement[2]),
    currency: quoteAgreement[3],
    termsAndConditions: quoteAgreement[4],
    timeframe: quoteAgreement[5],
    attesterSignature: quoteAgreement[6],
    claimerSignature: quoteAgreement[7],
    rootHash: quoteAgreement[8],
  }
}

export default {
  compressCost,
  decompressCost,
  decompressQuote,
  decompressQuoteAgreement,
  decompressAttesterSignedQuote,
  compressQuote,
  compressQuoteAgreement,
  compressAttesterSignedQuote,
}
