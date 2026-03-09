import PageHero from '../components/PageHero'
import StepEstimator from '../components/StepEstimator'

export default function Quote() {
  return (
    <>
      <PageHero
        title="Free Instant Quote"
        subtitle="Answer 4 quick questions and get a ballpark estimate — no personal info required."
      />
      <StepEstimator variant="quote" />
    </>
  )
}
