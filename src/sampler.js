export default class DefaultSampler {
    isSample(span, parent) {
        if (parent) {
            return parent.sampled
        }
        return true
    }
}
