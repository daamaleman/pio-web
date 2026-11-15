import { PageHeader } from "@/components/layout/PageHeader";

export function Placeholder({ title, step }: { title: string; step: string }) {
  return (
    <>
      <PageHeader title={title} />
      <div className="mx-5 mt-4 rounded-card border border-dashed border-linea bg-white p-8 text-center lg:mx-10">
        <img src="/pio-mascota.png" alt="" className="mx-auto h-20 w-20" />
        <p className="mt-3 font-bold">Esta pantalla llega en {step}.</p>
      </div>
    </>
  );
}
