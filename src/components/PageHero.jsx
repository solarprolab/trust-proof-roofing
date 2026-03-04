import WarrantyBadge from './WarrantyBadge'

export default function PageHero({ title, subtitle, showBadge = true }) {
  return (
    <section className="bg-[#1B3A6B] text-white py-14 px-4">
      <div className="max-w-7xl mx-auto text-center">
        {showBadge && (
          <div className="flex justify-center mb-4">
            <WarrantyBadge />
          </div>
        )}
        <h1 className="text-3xl sm:text-4xl font-black mb-3">{title}</h1>
        {subtitle && <p className="text-blue-200 text-lg max-w-2xl mx-auto">{subtitle}</p>}
      </div>
    </section>
  )
}
