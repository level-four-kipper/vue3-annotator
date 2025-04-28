import { TextLine } from '../Line/LineText'
import { Entities } from '../Label/Entity'
import { Text } from '../Label/Text'
import { VNode } from 'vue'
import { isValidComponentSize } from 'element-plus/es/utils'

export class TextSelector {
  constructor(private readonly allowOverlapping: boolean, private readonly graphemeMode: boolean) {}
  /**
   * Returns the offsets of the selected text.
   * @param {Entities} entities - To decide whether or not the offsets overlap the entities.
   * @param {Text} text - To convert the code point offsets to the grapheme offsets.
   * @returns {[number, number]} - The offsets of the selected text.
   */
  getOffsets(entities: Entities, text: Text): [number, number, boolean] {
    const [startOffset, endOffset] = this.getRange()
    let isValid = this.validate(startOffset, endOffset, entities)
    // if (this.validate(startOffset, endOffset, entities)) {
    //   return this.convert(startOffset, endOffset, text,  )
    // } else {
    //   throw new CustomRangeError({ startOffset, endOffset })
    // }
    return [...this.convert(startOffset, endOffset, text), isValid]
  }

  private getRange(): [number, number] {
    try {
      const selection = window.getSelection()
      // get elements.
      const startElement = selection!.anchorNode!.parentNode
      const endElement = selection!.focusNode!.parentNode

      // Get TextLine objects.
      // This depends on BaseText.vue component.
      // See the component in detail.
      const startLine = JSON.parse((startElement as unknown as HTMLElement)?.getAttribute('annotatorElement'))
      const endLine = JSON.parse((endElement as unknown as HTMLElement)?.getAttribute('annotatorElement'))
      const startOffset = startLine.startOffset + selection!.anchorOffset
      const endOffset = endLine.startOffset + selection!.focusOffset

      selection?.removeAllRanges()
      if (startOffset > endOffset) {
        return [endOffset, startOffset]
      } else {
        return [startOffset, endOffset]
      }
    } catch (error) {}
  }

  validate(startOffset: number, endOffset: number, entities: Entities): boolean {
    if (startOffset >= endOffset) {
      return false
    }
    if (this.allowOverlapping) {
      return true
    }
    if (entities.intersectAny(startOffset, endOffset)) {
      return false
    }
    return true
  }

  private convert(startOffset: number, endOffset: number, text: Text): [number, number] {
    if (this.graphemeMode) {
      return [text.toGraphemeOffset(startOffset)!, text.toGraphemeOffset(endOffset)!]
    } else {
      return [startOffset, endOffset]
    }
  }
}
