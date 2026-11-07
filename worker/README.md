# Feedback automático → GitHub Issues (opcional)

Sin esto, la burbuja abre un Issue prellenado en GitHub (necesita cuenta de GitHub).
Con esto, el pastor escribe y se crea el Issue solo, sin cuenta. Gratis (Cloudflare Workers).

## Pasos (una sola vez, ~10 minutos)

1. **Token de GitHub (fine-grained):** GitHub → Settings → Developer settings → Fine-grained tokens → *Generate*.
   - Repository access: solo `va-prototipos`.
   - Permissions: **Issues: Read and write**. Nada más.
   - Expiración: 90 días (renovar).
2. **Cuenta de Cloudflare** (gratis) → Workers & Pages → *Create Worker* → pega `index.js`.
3. En el Worker → Settings → Variables:
   - `REPO` = `Alcapone-Fx/va-prototipos`
   - `ALLOWED_ORIGIN` = `https://alcapone-fx.github.io`
   - `GITHUB_TOKEN` = el token (marcar como **Secret**).
4. Copia la URL del Worker (`https://....workers.dev`) y pégala en `js/feedback-config.js` → `endpoint`.
5. Haz commit y push. Listo.

El Worker solo acepta peticiones de la página de los prototipos, limita el tamaño, ignora bots (campo trampa) y solo permite etiquetas conocidas.
