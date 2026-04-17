const photos = [
  { id: 1, title: "Mountain Sunrise", category: "Landscape", placeholder: "bg-stone-700" },
  { id: 2, title: "City Lights", category: "Urban", placeholder: "bg-slate-700" },
  { id: 3, title: "Ocean Waves", category: "Nature", placeholder: "bg-cyan-900" },
  { id: 4, title: "Forest Path", category: "Nature", placeholder: "bg-green-900" },
  { id: 5, title: "Portrait Study", category: "Portrait", placeholder: "bg-rose-900" },
  { id: 6, title: "Desert Dunes", category: "Landscape", placeholder: "bg-amber-900" },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="px-8 py-6 flex items-center justify-between border-b border-white/10">
        <h1 className="text-2xl font-light tracking-widest uppercase">Gallery Flow</h1>
        <nav className="flex gap-6 text-sm text-white/60">
          <a href="#" className="hover:text-white transition-colors">Portfolio</a>
          <a href="#" className="hover:text-white transition-colors">About</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </nav>
      </header>

      <section className="px-8 py-16 text-center">
        <p className="text-white/40 tracking-widest text-xs uppercase mb-3">Photography</p>
        <h2 className="text-5xl font-extralight tracking-tight mb-4">Capturing Moments</h2>
        <p className="text-white/50 max-w-md mx-auto text-sm leading-relaxed">
          A curated collection of photography — landscapes, portraits, and the in-between.
        </p>
      </section>

      <section className="px-8 pb-16 columns-1 sm:columns-2 lg:columns-3 gap-4 max-w-6xl mx-auto">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="break-inside-avoid mb-4 group relative overflow-hidden rounded-sm cursor-pointer"
          >
            <div
              className={`${photo.placeholder} w-full aspect-[4/3] group-hover:scale-105 transition-transform duration-500`}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-end p-4 opacity-0 group-hover:opacity-100">
              <div>
                <p className="text-white font-medium text-sm">{photo.title}</p>
                <p className="text-white/60 text-xs">{photo.category}</p>
              </div>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
