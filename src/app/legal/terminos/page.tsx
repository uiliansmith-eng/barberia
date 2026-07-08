import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Términos y Condiciones — BarberOS",
  description: "Términos y condiciones de uso del servicio BarberOS.",
};

const sections = [
  {
    title: "1. Identificación del prestador",
    body: (
      <p>
        El presente servicio es prestado bajo la marca comercial{" "}
        <strong className="text-foreground">BarberOS</strong>. Para cualquier
        consulta puede contactar con nosotros en{" "}
        <a href="mailto:info@appstles.com" className="underline">
          info@appstles.com
        </a>
        .
      </p>
    ),
  },
  {
    title: "2. Objeto del servicio",
    body: (
      <>
        <p>
          BarberOS es una plataforma SaaS (Software as a Service) que permite
          a barberías gestionar su agenda de citas, clientes, servicios y
          equipo de barberos, recibir reservas online de sus propios clientes
          a través de un portal público, cobrar dichas citas online mediante
          Stripe Connect y aparecer en el directorio público de barberías.
        </p>
        <p>
          El acceso al panel de gestión requiere la creación de una cuenta de
          usuario y la aceptación de estos términos.
        </p>
      </>
    ),
  },
  {
    title: "3. Período de prueba",
    body: (
      <>
        <p>
          BarberOS ofrece un período de prueba gratuito de{" "}
          <strong className="text-foreground">14 días naturales</strong>{" "}
          desde el registro, sin necesidad de facilitar datos de pago.
        </p>
        <p>
          Transcurrido el período de prueba sin activar un plan de pago, la
          cuenta pasa automáticamente al plan gratuito, con un límite de 50
          citas creadas al mes. Superado ese límite, no podrán crearse nuevas
          citas hasta el siguiente mes o hasta que se active un plan de pago.
        </p>
      </>
    ),
  },
  {
    title: "4. Planes y precios",
    body: (
      <>
        <p>Los planes de suscripción disponibles y sus precios actuales son:</p>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-foreground">
                  Plan
                </th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">
                  Precio mensual
                </th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">
                  Citas / mes
                </th>
              </tr>
            </thead>
            <tbody className="bg-card">
              {[
                ["Gratis", "0 €/mes", "Hasta 50"],
                ["Pro", "14,99 €/mes", "Ilimitadas"],
                ["Business", "29,99 €/mes", "Ilimitadas"],
              ].map(([plan, price, citas]) => (
                <tr key={plan} className="border-t border-border">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {plan}
                  </td>
                  <td className="px-4 py-3">{price}</td>
                  <td className="px-4 py-3">{citas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Los precios son en euros e incluyen el IVA aplicable. BarberOS se
          reserva el derecho a modificar los precios con un preaviso mínimo
          de 30 días mediante comunicación por correo electrónico.
        </p>
      </>
    ),
  },
  {
    title: "5. Facturación y pago de la suscripción",
    body: (
      <>
        <p>
          El pago de la suscripción a BarberOS se realiza mediante tarjeta de
          crédito o débito a través de <strong className="text-foreground">Stripe</strong>,
          proveedor certificado PCI-DSS. BarberOS no almacena datos de
          tarjetas de pago.
        </p>
        <p>
          La suscripción se renueva automáticamente cada mes en la fecha de
          contratación. En caso de fallo en el cobro, se notificará al
          usuario por correo electrónico antes de suspender el acceso a las
          funciones de pago.
        </p>
      </>
    ),
  },
  {
    title: "6. Cobros online a los clientes finales (Stripe Connect)",
    body: (
      <>
        <p>
          BarberOS permite a cada barbería conectar su propia cuenta de{" "}
          <strong className="text-foreground">Stripe Connect</strong> para
          cobrar online a sus clientes el importe de las citas reservadas a
          través del portal público. En ese caso, la barbería es la
          titular de la cuenta de Stripe conectada y la
          <strong className="text-foreground"> vendedora y responsable</strong>{" "}
          frente a su cliente final de dicha transacción, incluyendo
          devoluciones, disputas y atención al cliente.
        </p>
        <p>
          BarberOS actúa exclusivamente como proveedor de la tecnología que
          facilita el cobro y no es parte del contrato de prestación de
          servicios de barbería entre la barbería y su cliente, ni retiene
          ni es titular de los fondos cobrados por esa vía.
        </p>
      </>
    ),
  },
  {
    title: "7. Cancelación y reembolsos",
    body: (
      <>
        <p>
          El usuario puede cancelar su suscripción en cualquier momento desde
          el panel de facturación (
          <em>Dashboard → Gestionar suscripción</em>). La cancelación tiene
          efecto al finalizar el período de facturación en curso; no se
          realizan reembolsos por el tiempo no utilizado.
        </p>
        <p>
          Tras la cancelación o baja de la cuenta, los datos de la barbería
          (agenda, clientes, servicios) se conservarán durante 30 días por si
          el usuario desea reactivar el servicio.
        </p>
      </>
    ),
  },
  {
    title: "8. Directorio público y formulario de contacto comercial",
    body: (
      <p>
        Las barberías que se dan de alta en BarberOS pueden aparecer en el
        directorio público de barberías (<code className="text-foreground">/barberias</code>).
        Quien complete el formulario de contacto comercial (
        <code className="text-foreground">/anadir-barberia</code>) para
        solicitar información acerca del servicio consiente ser contactado
        por BarberOS con fines comerciales relacionados con dicha solicitud.
      </p>
    ),
  },
  {
    title: "9. Obligaciones del usuario",
    body: (
      <>
        <p>El usuario se compromete a:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Proporcionar información veraz y actualizada durante el registro.</li>
          <li>Mantener la confidencialidad de sus credenciales de acceso.</li>
          <li>
            Usar el servicio exclusivamente para los fines descritos y
            conforme a la legalidad vigente.
          </li>
          <li>No ceder el acceso a terceros no autorizados.</li>
          <li>No intentar acceder a datos de otras barberías o usuarios.</li>
          <li>
            Recabar y tratar los datos de sus propios clientes conforme a la
            normativa de protección de datos aplicable.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "10. Disponibilidad del servicio",
    body: (
      <p>
        BarberOS se compromete a mantener una disponibilidad del servicio
        razonable, si bien no garantiza la disponibilidad ininterrumpida y
        se reserva el derecho a realizar tareas de mantenimiento,
        preferentemente fuera del horario habitual de actividad de las
        barberías.
      </p>
    ),
  },
  {
    title: "11. Limitación de responsabilidad",
    body: (
      <p>
        BarberOS no será responsable de los daños indirectos, lucro cesante
        o pérdida de datos derivados del uso o la imposibilidad de uso del
        servicio, ni de las disputas entre una barbería y sus clientes
        finales derivadas de citas, cobros o cancelaciones. En cualquier
        caso, la responsabilidad máxima de BarberOS frente al usuario
        quedará limitada al importe abonado por el usuario en los 3 meses
        anteriores al hecho generador del daño.
      </p>
    ),
  },
  {
    title: "12. Propiedad intelectual",
    body: (
      <>
        <p>
          Todo el software, diseño, logotipos y contenidos de BarberOS son
          propiedad exclusiva del prestador del servicio. El usuario obtiene
          una licencia de uso no exclusiva, no transferible y revocable
          mientras mantenga activa su suscripción.
        </p>
        <p>
          Los contenidos introducidos por el usuario en la plataforma (datos
          de la barbería, servicios, precios, etc.) son propiedad del
          usuario, quien otorga a BarberOS una licencia para alojarlos y
          mostrarlos a sus clientes y, en su caso, en el directorio público.
        </p>
      </>
    ),
  },
  {
    title: "13. Modificación de los términos",
    body: (
      <p>
        BarberOS podrá modificar estos términos en cualquier momento. Los
        cambios relevantes serán comunicados por correo electrónico con un
        preaviso de al menos 15 días. El uso continuado del servicio tras la
        entrada en vigor de los nuevos términos implica su aceptación.
      </p>
    ),
  },
  {
    title: "14. Ley aplicable y jurisdicción",
    body: (
      <p>
        Estos términos se rigen por la legislación española. Para cualquier
        controversia, las partes se someten a los juzgados y tribunales de
        Barcelona, renunciando expresamente a cualquier otro fuero.
      </p>
    ),
  },
];

export default function TerminosPage() {
  return (
    <div className="dark bg-mesh-dark flex flex-1 flex-col bg-background text-foreground">
      <Navbar />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Términos y Condiciones
        </h1>
        <p className="mb-12 mt-2 text-sm text-muted-foreground">
          Última actualización: julio de 2026
        </p>

        <div className="flex flex-col gap-10 text-sm leading-relaxed text-muted-foreground">
          {sections.map((s) => (
            <section key={s.title} className="flex flex-col gap-3">
              <h2 className="text-base font-bold text-foreground">{s.title}</h2>
              {s.body}
            </section>
          ))}

          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <p className="mb-1 font-semibold text-foreground">Contacto</p>
            <p>
              Para cualquier consulta sobre estos términos:{" "}
              <a href="mailto:info@appstles.com" className="underline">
                info@appstles.com
              </a>
            </p>
          </div>

          <p>
            Consulta también nuestra{" "}
            <Link href="/legal/privacidad" className="underline">
              Política de Privacidad
            </Link>
            .
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
