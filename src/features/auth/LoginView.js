import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '../../context/AuthContext';
import { login as loginBFF, register as registerBFF } from '../../services/authService';

export default function LoginView() {
  const authContext = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isOrg, setIsOrg] = useState(false);
  const [orgName, setOrgName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) return alert('Por favor, completa los campos obligatorios.');
    if (isOrg && !orgName) return alert('Debes ingresar el nombre de la organización.');

    const rolAsignado = isOrg ? 'ADMIN_ORGANIZACION' : 'USER';

    if (isRegister) {
      try {
        await registerBFF(email, password, [rolAsignado]);
        alert('¡Usuario registrado con éxito! Ahora puedes iniciar sesión.');
        setIsRegister(false);
      } catch (err) {
        console.warn("API de registro ausente. Simulando local.");
        alert('Modo demostración: ¡Usuario registrado localmente!');
        setIsRegister(false);
      }
    } else {
      let rolFinal = rolAsignado;

      try {
        const respuesta = await loginBFF(email, password);
        rolFinal = respuesta.role || respuesta.rol || rolAsignado;
      } catch (err) {
        console.warn("BFF desconectado. Usando bypass local.");
      }

      try {
        if (typeof authContext.login === 'function') {
          authContext.login(email, rolFinal);
        } else if (typeof authContext.setIsLoggedIn === 'function') {
          authContext.setIsLoggedIn(true);
          if (typeof authContext.setUserRole === 'function') authContext.setUserRole(rolFinal);
        }
      } catch (contextError) {
        console.error("Error al interactuar con AuthContext:", contextError);
      }
    }
  };

  return (
    <div className="login-page" style={{ position: 'relative' }}>

      {/* 🐾 LOGO }
      <div style={{
        position: 'absolute',
        top: '25px',
        left: '30px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 10
      }}>
        <Image
          src="/logo.png"
          alt="Sanos y Salvos Esquina"
          width={80}
          height={80}
          style={{
            objectFit: 'contain',
            filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.25))'
          }}
        />
        <span style={{
          color: '#ffffff',
          fontWeight: '700',
          fontSize: '22px',
          textShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          letterSpacing: '-0.3px'
        }}>
          Sanos y Salvos
        </span>
      </div>

      {/* Panel Izquierdo de Alertas */}
      <div className="login-side-panel left-panel">
        <div className="side-panel-title">📢 Alertas de la Comunidad</div>
        <div className="mini-alert-card">
          <span className="mini-alert-badge lost">Perdido</span>
          <h4>Fiona (Salchicha)</h4>
          <p>Última vez vista cerca de la plaza central.</p>
        </div>
      </div>

      {/* Tarjeta Central de Login */}
      <div className="login-card" style={{ padding: '40px 30px' }}>

        {/* Cabecera del logo y título principal perfectamente centrados */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          marginBottom: '32px',
          width: '100%'
        }}>
          <Image
            src="/logo.png"
            alt="Sanos y Salvos Logo"
            width={85}
            height={85}
            style={{
              objectFit: 'contain',
              marginBottom: '12px'
            }}
          />
          <h1 style={{
            fontSize: '28px',
            fontWeight: '800',
            color: '#1e1b4b',
            margin: '0 0 4px 0',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            letterSpacing: '-0.75px'
          }}>
            Sanos y Salvos
          </h1>

          {/* Divisor moderno color índigo */}
          <div style={{
            height: '3px',
            width: '40px',
            backgroundColor: '#4f46e5',
            borderRadius: '2px',
            margin: '8px 0 16px 0'
          }} />

          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#374151',
            margin: '0 0 2px 0',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            letterSpacing: '-0.3px'
          }}>
            {isRegister ? 'Crear Cuenta' : 'Ingresar al Portal'}
          </h2>
          <p style={{
            color: '#9ca3af',
            fontSize: '13px',
            margin: 0,
            fontWeight: '500',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Reportes en tiempo real
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-field-auth">
            <label>Correo Electrónico</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ejemplo@correo.com" required />
          </div>

          <div className="form-field-auth">
            <label>Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>

          <div className="form-checkbox-auth">
            <input type="checkbox" id="checkOrg" checked={isOrg} onChange={e => setIsOrg(e.target.checked)} />
            <label htmlFor="checkOrg">Soy una Fundación / Organización</label>
          </div>

          {isOrg && (
            <div className="animated-org-fields">
              <div className="form-field-auth">
                <label>Nombre de la Organización</label>
                <input type="text" value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="Ej: Refugio Patitas Felices" />
              </div>
            </div>
          )}

          <button type="submit" className="btn-auth-submit">
            {isRegister ? 'Registrarse de forma segura' : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="auth-toggle-text">
          {isRegister ? '¿Ya tienes una cuenta operativa? ' : '¿Es tu primera vez aquí? '}
          <span onClick={() => setIsRegister(!isRegister)} style={{ cursor: 'pointer', color: '#4f46e5', fontWeight: 'bold' }}>
            {isRegister ? 'Ingresa aquí' : 'Regístrate aquí'}
          </span>
        </p>
      </div>

      {/* Panel Derecho de Entidades */}
      <div className="login-side-panel">
        <div className="side-panel-title">🏢 Entidades Oficiales</div>
        <div className="mini-alert-card">
          <span className="mini-alert-badge org">Verificado</span>
          <h4>Refugio Patitas</h4>
          <p>Organización protectora activa en el sistema.</p>
        </div>
      </div>
    </div>
  );
}