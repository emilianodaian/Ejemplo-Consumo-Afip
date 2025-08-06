# Ejemplo TypeScript Angular - Captura de Fecha y Hora desde AFIP

Este ejemplo muestra cómo integrar el servicio oficial de fecha y hora de AFIP Argentina (`time.afip.gov.ar`) en una aplicación Angular usando TypeScript.

## 📋 Descripción

El ejemplo incluye:
- **Servicio Angular** (`TimeService`) para consumir el endpoint de AFIP
- **Componente de visualización** (`TimeDisplayComponent`) con interfaz moderna
- **Manejo completo de errores** y estados de carga
- **Parsing de respuesta XML** del servicio AFIP
- **Interfaz responsive** con diseño limpio y moderno

## 🚀 Instalación y Configuración

### 1. Prerequisitos

Asegúrate de tener instalado:
- Node.js (versión 16 o superior)
- Angular CLI (`npm install -g @angular/cli`)

### 2. Crear nuevo proyecto Angular (si no tienes uno)

```bash
ng new afip-time-app
cd afip-time-app
```

### 3. Copiar los archivos del ejemplo

Copia todos los archivos de este ejemplo a tu proyecto Angular:

```
src/app/
├── services/
│   └── time.service.ts
├── components/
│   └── time-display/
│       ├── time-display.component.ts
│       ├── time-display.component.html
│       └── time-display.component.css
├── app.module.ts
├── app.component.ts
├── app.component.html
├── app.component.css
└── app-routing.module.ts
```

### 4. Instalar dependencias

```bash
npm install
```

### 5. Ejecutar la aplicación

```bash
ng serve
```

La aplicación estará disponible en `http://localhost:4200`

## 🔧 Estructura del Código

### TimeService (`src/app/services/time.service.ts`)

Servicio principal que:
- Realiza petición HTTP GET a `http://time.afip.gov.ar`
- Parsea la respuesta XML usando `DOMParser`
- Extrae los elementos `<fecha>` y `<hora>`
- Maneja errores de conexión y parsing
- Retorna un Observable con la interfaz `AfipTimeResponse`

```typescript
export interface AfipTimeResponse {
  fecha: string; // Formato: YYYYMMDD
  hora: string;  // Formato: HHMMSS
}
```

### TimeDisplayComponent

Componente que:
- Inyecta el `TimeService`
- Maneja estados de carga, error y éxito
- Formatea la fecha y hora para visualización
- Permite refrescar los datos
- Muestra una interfaz moderna y responsive

### Características del Componente

- **Estados visuales**: Loading, Error, Success
- **Formateo automático**: Convierte YYYYMMDD a DD/MM/YYYY y HHMMSS a HH:MM:SS
- **Botón de actualización**: Para obtener la hora actual
- **Manejo de errores**: Mensajes claros para diferentes tipos de error
- **Diseño responsive**: Se adapta a dispositivos móviles

## 🌐 Endpoint AFIP

**URL**: `http://time.afip.gov.ar`

**Respuesta XML esperada**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <fecha>20241201</fecha>
    <hora>143022</hora>
  </soap:Body>
</soap:Envelope>
```

## 🛠️ Personalización

### Modificar el formato de fecha y hora

En `time-display.component.ts`, puedes personalizar los métodos:

```typescript
formatDate(fecha: string): string {
  // Tu lógica de formateo personalizada
}

formatTime(hora: string): string {
  // Tu lógica de formateo personalizada
}
```

### Cambiar estilos

Modifica `time-display.component.css` para personalizar:
- Colores del tema
- Tipografía
- Espaciado y layout
- Animaciones

### Agregar funcionalidades

Puedes extender el servicio para:
- Cachear respuestas
- Agregar retry automático
- Implementar polling periódico
- Guardar histórico de consultas

## 🔍 Manejo de Errores

El servicio maneja diferentes tipos de errores:

- **Error 0**: Problemas de conectividad
- **Error 404**: Servicio no encontrado
- **Error 500**: Error interno del servidor AFIP
- **Error 503**: Servicio temporalmente no disponible
- **Errores de parsing**: XML malformado o elementos faltantes

## 📱 Compatibilidad

- **Angular**: 12+
- **TypeScript**: 4.0+
- **Navegadores**: Chrome, Firefox, Safari, Edge (versiones modernas)
- **Dispositivos**: Desktop, tablet, móvil

## 🚨 Consideraciones de CORS

El endpoint de AFIP puede tener restricciones CORS. Para desarrollo local, puedes:

1. **Usar proxy de Angular** (recomendado):

Crear `proxy.conf.json`:
```json
{
  "/api/afip/*": {
    "target": "http://time.afip.gov.ar",
    "secure": true,
    "changeOrigin": true,
    "logLevel": "debug",
    "pathRewrite": {
      "^/api/afip": ""
    }
  }
}
```

Ejecutar con proxy:
```bash
ng serve --proxy-config proxy.conf.json
```

2. **Extensión de navegador** para deshabilitar CORS (solo desarrollo)

3. **Servidor proxy personalizado** para producción

## 📝 Ejemplo de Uso

```typescript
// Inyectar el servicio en cualquier componente
constructor(private timeService: TimeService) {}

// Obtener fecha y hora
this.timeService.getTime().subscribe({
  next: (data) => {
    console.log('Fecha:', data.fecha); // "20241201"
    console.log('Hora:', data.hora);   // "143022"
  },
  error: (error) => {
    console.error('Error:', error.message);
  }
});
```

## 🤝 Contribuciones

Este es un ejemplo educativo. Siéntete libre de:
- Mejorar el manejo de errores
- Agregar tests unitarios
- Optimizar el rendimiento
- Mejorar la accesibilidad
- Agregar internacionalización

## 📄 Licencia

Este ejemplo es de dominio público y puede ser usado libremente en proyectos comerciales y no comerciales.

---

**Nota**: Este ejemplo está diseñado para funcionar con el servicio oficial de AFIP Argentina. Asegúrate de cumplir con los términos de uso del servicio y las regulaciones aplicables.
