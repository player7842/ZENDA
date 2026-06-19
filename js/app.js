(function () {
  'use strict';

  /* ROLES Y NAVEGACION */

  function getRole() {
    var pf = JSON.parse(localStorage.getItem('zenda_profile') || '{}');
    var r = (pf.rol || 'Aprendiz').toLowerCase();
    if (r.indexOf('instructor') > -1) return 'instructor';
    if (r.indexOf('admin') > -1) return 'administrador';
    return 'aprendiz';
  }

  var NAV_CONFIG = {
    aprendiz: {
      dashboard: 'dashboard.html',
      roleLabel: 'Aprendiz',
      groups: [
        { label: 'Principal', items: [
          { key:'dashboard',    icon:'grid-1x2',     label:'Dashboard',          href:'dashboard.html' },
          { key:'proyectos',    icon:'kanban',        label:'Proyectos',          href:'proyectos.html' },
          { key:'tareas',       icon:'check2-square',  label:'Tareas',             href:'tareas.html' },
          { key:'seguimiento',  icon:'bar-chart',     label:'Seguimiento semanal', href:'seguimiento.html' },
          { key:'calendario',   icon:'calendar3',     label:'Calendario',          href:'calendario.html' }
        ]},
        { label: 'Cuenta', items: [
          { key:'perfil',        icon:'person-circle', label:'Perfil',        href:'perfil.html' },
          { key:'configuracion', icon:'gear',          label:'Configuracion', href:'configuracion.html' }
        ]}
      ]
    },
    instructor: {
      dashboard: 'dashboard-instructor.html',
      roleLabel: 'Instructor',
      groups: [
        { label: 'Principal', items: [
          { key:'dashboard',     icon:'grid-1x2',  label:'Dashboard',              href:'dashboard-instructor.html' },
          { key:'revision',      icon:'kanban',     label:'Proyectos a revisar',    href:'proyectos-instructor.html' },
          { key:'seguimiento-i', icon:'bar-chart',  label:'Seguimiento aprendices', href:'seguimiento-instructor.html' },
          { key:'calendario',    icon:'calendar3',  label:'Calendario',             href:'calendario.html' }
        ]},
        { label: 'Cuenta', items: [
          { key:'perfil',        icon:'person-circle', label:'Perfil',        href:'perfil.html' },
          { key:'configuracion', icon:'gear',          label:'Configuracion', href:'configuracion.html' }
        ]}
      ]
    },
    administrador: {
      dashboard: 'dashboard-admin.html',
      roleLabel: 'Administrador',
      groups: [
        { label: 'Principal', items: [
          { key:'dashboard',     icon:'speedometer', label:'Dashboard',              href:'dashboard-admin.html' },
          { key:'usuarios',      icon:'people',       label:'Usuarios',               href:'usuarios.html' },
          { key:'revision',      icon:'kanban',       label:'Proyectos',              href:'proyectos-instructor.html' },
          { key:'seguimiento-i', icon:'bar-chart',    label:'Seguimiento aprendices', href:'seguimiento-instructor.html' },
          { key:'calendario',    icon:'calendar3',    label:'Calendario',             href:'calendario.html' }
        ]},
        { label: 'Cuenta', items: [
          { key:'perfil',        icon:'person-circle', label:'Perfil',        href:'perfil.html' },
          { key:'configuracion', icon:'gear',          label:'Configuracion', href:'configuracion.html' }
        ]}
      ]
    }
  };

  function renderSidebar(activeKey) {
    var nav = document.getElementById('sidebar-nav');
    if (!nav) return;
    var role = getRole();
    var cfg  = NAV_CONFIG[role] || NAV_CONFIG.aprendiz;
    var html = '';
    cfg.groups.forEach(function (g) {
      html += '<div class="nav-group-label">' + g.label + '</div>';
      g.items.forEach(function (it) {
        var active = it.key === activeKey ? ' active' : '';
        html += '<a href="' + it.href + '" class="nav-item' + active + '">'
              + '<i class="bi bi-' + it.icon + '"></i> ' + it.label + '</a>';
      });
    });
    nav.innerHTML = html;

    var roleBadge = document.getElementById('role-badge');
    if (roleBadge) roleBadge.textContent = cfg.roleLabel;
  }

  window.getRole       = getRole;
  window.renderSidebar = renderSidebar;
  window.NAV_CONFIG    = NAV_CONFIG;
  window.roleDashboard = function () {
    return (NAV_CONFIG[getRole()] || NAV_CONFIG.aprendiz).dashboard;
  };

  /* TEMA */

  var THEME_KEY = 'zenda_theme';

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    var btn = document.getElementById('themeToggle');
    if (btn) {
      btn.innerHTML = theme === 'dark'
        ? '<i class="bi bi-sun"></i>'
        : '<i class="bi bi-moon-stars"></i>';
      btn.title = theme === 'dark' ? 'Modo claro' : 'Modo oscuro';
    }
  }

  var savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
  applyTheme(savedTheme);

  document.addEventListener('DOMContentLoaded', function () {
    applyTheme(savedTheme);

    /* Sidebar dinamico por rol*/

    var sidebarNav = document.getElementById('sidebar-nav');
    if (sidebarNav) renderSidebar(sidebarNav.dataset.active || '');

  
    /*Toggle tema */

    var toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function () {
        var cur = document.documentElement.getAttribute('data-theme');
        applyTheme(cur === 'dark' ? 'light' : 'dark');
      });
    }

    /*Sidebar */
    
    var sidebar   = document.getElementById('sidebar');
    var overlay   = document.getElementById('overlay');
    var hamburger = document.getElementById('hamburger');

    function openSidebar()  {
      if (!sidebar) return;
      sidebar.classList.add('open');
      if (overlay) overlay.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
    function closeSidebar() {
      if (!sidebar) return;
      sidebar.classList.remove('open');
      if (overlay) overlay.classList.remove('show');
      document.body.style.overflow = '';
    }

    if (hamburger) hamburger.addEventListener('click', function () {
      sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
    });
    if (overlay) overlay.addEventListener('click', closeSidebar);

    /* Nav activo por página */

    var cur = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-item[data-page]').forEach(function (l) {
      if (l.dataset.page === cur) {
        document.querySelectorAll('.nav-item').forEach(function (x) { x.classList.remove('active'); });
        l.classList.add('active');
      }
    });

    /*Modales*/

    document.querySelectorAll('[data-modal-open]').forEach(function (btn) {
      btn.addEventListener('click', function () { openModal(btn.dataset.modalOpen); });
    });
    document.querySelectorAll('[data-modal-close]').forEach(function (btn) {
      btn.addEventListener('click', function () { closeModal(btn.dataset.modalClose); });
    });
    document.querySelectorAll('.modal-backdrop').forEach(function (bd) {
      bd.addEventListener('click', function (e) {
        if (e.target === bd) closeAllModals();
      });
    });

    /*Dropdowns*/

    document.querySelectorAll('[data-dropdown]').forEach(function (t) {
      t.addEventListener('click', function (e) {
        e.stopPropagation();
        var menu = document.getElementById(t.dataset.dropdown);
        if (!menu) return;
        var open = menu.classList.contains('show');
        closeAllDropdowns();
        if (!open) menu.classList.add('show');
      });
    });
    document.addEventListener('click', closeAllDropdowns);

    /* Tabs*/

    document.querySelectorAll('[data-tabs]').forEach(function (group) {
      var name   = group.dataset.tabs;
      var tabs   = group.querySelectorAll('.tab');
      var panels = document.querySelectorAll('.tab-panel[data-tab-group="' + name + '"]');
      tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          tabs.forEach(function (t) { t.classList.remove('active'); });
          panels.forEach(function (p) { p.classList.remove('active'); });
          tab.classList.add('active');
          var target = document.querySelector(
            '.tab-panel[data-tab-group="' + name + '"][data-tab="' + tab.dataset.tab + '"]'
          );
          if (target) target.classList.add('active');
        });
      });
    });

    /*Toggle password */

    document.querySelectorAll('.toggle-password').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var input = document.querySelector(btn.dataset.target);
        if (!input) return;
        var isText = input.type === 'text';
        input.type = isText ? 'password' : 'text';
        btn.querySelector('i').className = isText ? 'bi bi-eye' : 'bi bi-eye-slash';
      });
    });

    /* Progress bars animadas*/

    document.querySelectorAll('.progress-fill[data-w]').forEach(function (bar) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            bar.style.width = bar.dataset.w + '%';
            obs.unobserve(bar);
          }
        });
      }, { threshold: 0.2 });
      bar.style.width = '0%';
      obs.observe(bar);
    });

    /* ESC cierra todo*/

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeSidebar(); closeAllModals(); closeAllDropdowns(); }
    });
  });

  /*FUNCIONES GLOBALES*/

  function closeAllModals() {
    document.querySelectorAll('.modal-backdrop.show').forEach(function (m) {
      m.classList.remove('show');
    });
    document.body.style.overflow = '';
  }

  function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-menu.show').forEach(function (d) {
      d.classList.remove('show');
    });
  }

  window.openModal = function (id) {
    var m = document.getElementById(id);
    if (m) { m.classList.add('show'); document.body.style.overflow = 'hidden'; }
  };

  window.closeModal = function (id) {
    var m = document.getElementById(id);
    if (m) { m.classList.remove('show'); document.body.style.overflow = ''; }
  };

  window.toast = function (msg, type, duration) {
    type     = type     || 'success';
    duration = duration || 3000;
    var icons = {
      success: 'bi-check-circle-fill',
      error:   'bi-x-circle-fill',
      warn:    'bi-exclamation-triangle-fill',
      info:    'bi-info-circle-fill'
    };
    var container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    var el = document.createElement('div');
    el.className = 'toast ' + type;
    el.innerHTML = '<i class="bi ' + (icons[type] || icons.info) + ' ti"></i><span>' + msg + '</span>';
    container.appendChild(el);
    setTimeout(function () {
      el.style.transition = 'opacity .25s ease, transform .25s ease';
      el.style.opacity    = '0';
      el.style.transform  = 'translateY(6px)';
      setTimeout(function () { el.remove(); }, 280);
    }, duration);
  };

  window.switchPage = function (href) { window.location.href = href; };

  /*Validaciones reutilizables */

  window.validarCorreo = function (email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  window.validarSena = function (email) {
    return email.toLowerCase().endsWith('@misena.edu.co') ||
           email.toLowerCase().endsWith('@sena.edu.co');
  };

  window.setFieldError = function (inputId, msg) {
    var input = document.getElementById(inputId);
    if (!input) return;
    input.classList.add('error');
    var prev = input.parentElement.querySelector('.form-error');
    if (prev) prev.remove();
    var err = document.createElement('div');
    err.className = 'form-error';
    err.innerHTML = '<i class="bi bi-exclamation-circle"></i>' + msg;
    input.parentElement.appendChild(err);
    input.addEventListener('input', function fix() {
      input.classList.remove('error');
      var e = input.parentElement.querySelector('.form-error');
      if (e) e.remove();
      input.removeEventListener('input', fix);
    }, { once: true });
  };

  window.clearErrors = function () {
    document.querySelectorAll('.input.error').forEach(function (i) { i.classList.remove('error'); });
    document.querySelectorAll('.form-error').forEach(function (e) { e.remove(); });
  };

})();
