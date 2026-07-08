import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Política de Privacidad — BarberOS",
  description: "Política de privacidad y protección de datos de BarberOS.",
};

export default function PrivacidadPage() {
  return (
    <div className="dark bg-mesh-dark flex flex-1 flex-col bg-background text-foreground">
      <Navbar />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Política de Privacidad
        </h1>
        <p className="mb-12 mt-2 text-sm text-muted-foreground">
          Última actualización: julio de 2026
        </p>

        <div className="flex flex-col gap-10 text-sm leading-relaxed text-muted-foreground">
          <section className="flex flex-col gap-3">
            <h2 className="text-base font-bold text-foreground">
              1. Responsable del tratamiento
            </h2>
            <p>
              El responsable del tratamiento de sus datos personales como
              usuario de la plataforma es{" "}
              <strong className="text-foreground">BarberOS</strong> (marca
              comercial), con dirección de contacto en{" "}
              <a href="mailto:info@appstles.com" className="underline">
                info@appstles.com
              </a>
              . Para los datos de los clientes finales de cada barbería, ver
              el apartado 3.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-base font-bold text-foreground">
              2. Datos que recopilamos
            </h2>
            <p>Recopilamos los siguientes datos según el uso que haga del servicio:</p>
            <div className="flex flex-col gap-4">
              <div>
                <p className="mb-1 font-semibold text-foreground">
                  Datos de cuenta (dueños y equipo de la barbería)
                </p>
                <p>
                  Nombre completo, correo electrónico, teléfono y contraseña
                  cifrada al registrarse.
                </p>
              </div>
              <div>
                <p className="mb-1 font-semibold text-foreground">
                  Datos de la barbería
                </p>
                <p>
                  Nombre del negocio, dirección, teléfono, logotipo, servicios,
                  precios y datos de equipo (barberos) introducidos por el
                  usuario.
                </p>
              </div>
              <div>
                <p className="mb-1 font-semibold text-foreground">
                  Datos de clientes finales de la barbería
                </p>
                <p>
                  Nombre, teléfono y, en su caso, correo electrónico, que el
                  propio cliente facilita al reservar una cita a través del
                  portal público de reserva, o que la barbería introduce en
                  su ficha de cliente. También el contenido de las reseñas
                  que un cliente decida publicar (nombre, valoración y
                  comentario), visibles públicamente en el directorio.
                </p>
              </div>
              <div>
                <p className="mb-1 font-semibold text-foreground">
                  Datos de uso
                </p>
                <p>
                  Citas, servicios contratados, analíticas del negocio y
                  registros de actividad.
                </p>
              </div>
              <div>
                <p className="mb-1 font-semibold text-foreground">
                  Datos de facturación y pago
                </p>
                <p>
                  Historial de pagos y estado de suscripción, gestionados a
                  través de Stripe. Si la barbería activa cobros online,
                  también se gestionan a través de Stripe (mediante Stripe
                  Connect) los pagos de sus clientes. BarberOS no almacena
                  datos de tarjetas de crédito.
                </p>
              </div>
              <div>
                <p className="mb-1 font-semibold text-foreground">
                  Datos de contacto comercial
                </p>
                <p>
                  Si completa el formulario de{" "}
                  <code className="text-foreground">/anadir-barberia</code>,
                  recopilamos el nombre del negocio, nombre de contacto,
                  correo, teléfono y dirección facilitados para poder
                  responder a su solicitud.
                </p>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-base font-bold text-foreground">
              3. Responsable vs. encargado del tratamiento
            </h2>
            <p>
              Para los datos de los clientes finales de cada barbería (nombre,
              teléfono, historial de citas, etc.), la barbería titular de la
              cuenta actúa como{" "}
              <strong className="text-foreground">responsable del tratamiento</strong>
              , y BarberOS actúa como{" "}
              <strong className="text-foreground">encargado del tratamiento</strong>{" "}
              conforme al artículo 28 del RGPD, tratando esos datos únicamente
              siguiendo las instrucciones de la barbería y para prestar el
              servicio contratado.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-base font-bold text-foreground">
              4. Finalidad y base jurídica del tratamiento
            </h2>
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">
                      Finalidad
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">
                      Base jurídica
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card">
                  {[
                    ["Prestación del servicio contratado", "Ejecución del contrato (Art. 6.1.b RGPD)"],
                    ["Gestión de reservas de clientes finales", "Ejecución del contrato / interés legítimo de la barbería (Art. 6.1.b y f RGPD)"],
                    ["Facturación y gestión de pagos", "Obligación legal (Art. 6.1.c RGPD)"],
                    ["Comunicaciones sobre el servicio", "Interés legítimo (Art. 6.1.f RGPD)"],
                    ["Respuesta a solicitudes comerciales", "Consentimiento (Art. 6.1.a RGPD)"],
                    ["Mejora y seguridad de la plataforma", "Interés legítimo (Art. 6.1.f RGPD)"],
                  ].map(([fin, base]) => (
                    <tr key={fin} className="border-t border-border">
                      <td className="px-4 py-3">{fin}</td>
                      <td className="px-4 py-3 text-muted-foreground/80">{base}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-base font-bold text-foreground">
              5. Encargados del tratamiento
            </h2>
            <p>BarberOS utiliza los siguientes proveedores de confianza que tratan datos en su nombre:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="text-foreground">Supabase</strong> (base de
                datos y autenticación) — servidores en la Unión Europea
                (Irlanda).
              </li>
              <li>
                <strong className="text-foreground">Vercel</strong>{" "}
                (alojamiento de la aplicación).
              </li>
              <li>
                <strong className="text-foreground">Stripe</strong> (pagos y
                suscripciones) — certificado PCI-DSS nivel 1.
              </li>
              <li>
                <strong className="text-foreground">Resend</strong> (envío de
                correos transaccionales: confirmaciones de cita, recordatorios
                y notificaciones).
              </li>
            </ul>
            <p>
              Todos los encargados disponen de garantías adecuadas de
              protección de datos conforme al RGPD.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-base font-bold text-foreground">
              6. Conservación de los datos
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Datos de cuenta y de la barbería: mientras la cuenta esté
                activa y durante los 30 días posteriores a la baja.
              </li>
              <li>
                Datos de clientes finales (citas, fichas de cliente): mientras
                la barbería mantenga la cuenta activa, salvo que el cliente
                final ejerza su derecho de supresión ante la barbería.
              </li>
              <li>
                Datos de facturación: 7 años, por obligación fiscal (Ley
                58/2003 General Tributaria).
              </li>
              <li>Registros de actividad: 12 meses.</li>
              <li>
                Datos de solicitudes comerciales sin respuesta: 24 meses desde
                el último contacto.
              </li>
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-base font-bold text-foreground">
              7. Sus derechos
            </h2>
            <p>
              Como titular de los datos, puede ejercer los siguientes derechos
              dirigiéndose a{" "}
              <a href="mailto:info@appstles.com" className="underline">
                info@appstles.com
              </a>
              . Si es cliente final de una barbería y su solicitud se refiere
              a los datos que esa barbería gestiona sobre usted, le
              redirigiremos a la barbería correspondiente como responsable de
              esos datos, o le asistiremos para localizarla:
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong className="text-foreground">Acceso:</strong> conocer
                qué datos tratamos sobre usted.
              </li>
              <li>
                <strong className="text-foreground">Rectificación:</strong>{" "}
                corregir datos inexactos o incompletos.
              </li>
              <li>
                <strong className="text-foreground">Supresión:</strong>{" "}
                solicitar la eliminación de sus datos cuando ya no sean
                necesarios.
              </li>
              <li>
                <strong className="text-foreground">Limitación:</strong>{" "}
                solicitar que suspendamos el tratamiento en determinadas
                circunstancias.
              </li>
              <li>
                <strong className="text-foreground">Portabilidad:</strong>{" "}
                recibir sus datos en formato estructurado y de uso común.
              </li>
              <li>
                <strong className="text-foreground">Oposición:</strong>{" "}
                oponerse al tratamiento basado en interés legítimo.
              </li>
            </ul>
            <p>
              Responderemos en un plazo máximo de 30 días. Si considera que
              sus derechos no han sido atendidos, puede presentar una
              reclamación ante la{" "}
              <a
                href="https://www.aepd.es"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Agencia Española de Protección de Datos (AEPD)
              </a>
              .
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-base font-bold text-foreground">8. Cookies</h2>
            <p>
              BarberOS utiliza únicamente cookies técnicas estrictamente
              necesarias para el funcionamiento del servicio (gestión de la
              sesión de usuario autenticado). No se utilizan cookies de
              publicidad ni de seguimiento de terceros.
            </p>
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">
                      Cookie
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">
                      Finalidad
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">
                      Duración
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card">
                  <tr className="border-t border-border">
                    <td className="px-4 py-3 font-mono text-xs">sb-*</td>
                    <td className="px-4 py-3">
                      Sesión de autenticación (Supabase)
                    </td>
                    <td className="px-4 py-3">Sesión / 1 semana</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-base font-bold text-foreground">
              9. Seguridad
            </h2>
            <p>
              BarberOS aplica medidas técnicas y organizativas para proteger
              sus datos: cifrado TLS en las comunicaciones, contraseñas
              almacenadas con hash seguro, aislamiento de datos entre
              barberías mediante políticas de seguridad a nivel de fila
              (Row Level Security) en la base de datos, y acceso restringido
              por roles.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-base font-bold text-foreground">
              10. Modificaciones
            </h2>
            <p>
              BarberOS puede actualizar esta política para reflejar cambios en
              el servicio o en la normativa aplicable. Le notificaremos por
              correo electrónico ante cambios sustanciales con al menos 15
              días de antelación.
            </p>
          </section>

          <div className="mt-4 rounded-xl border border-border bg-card p-5">
            <p className="mb-1 font-semibold text-foreground">
              Contacto para cuestiones de privacidad
            </p>
            <p>
              <a href="mailto:info@appstles.com" className="underline">
                info@appstles.com
              </a>
            </p>
          </div>

          <p>
            Consulta también nuestros{" "}
            <Link href="/legal/terminos" className="underline">
              Términos y Condiciones
            </Link>
            .
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
