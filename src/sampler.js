export class DefaultSampler {
    /**
     * @param  {Span} span Span to be determined.
     * @return {Boolean} whether current span is a sample.
     */
    isSampled(span) { // eslint-disable-line
        return true
    }
}
