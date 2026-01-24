(function () {
    const { useEffect, useState } = React;
    const rootElement = document.getElementById('root');
    const root = ReactDOM.createRoot(rootElement);
    const createElement = React.createElement;

    const apiBase = window.API_BASE_URL || 'http://localhost:3000';

    function buildApiUrl(path) {
        return `${apiBase}${path}`;
    }

    function formatPrice(value) {
        if (value === null || value === undefined || Number.isNaN(Number(value))) {
            return 'S/ -';
        }

        return `S/ ${Number(value).toFixed(2)}`;
    }

    function getVariantTitle(variant) {
        const baseName = variant && variant.product ? variant.product.name : 'Producto';
        if (variant && variant.variantName) {
            return `${baseName} - ${variant.variantName}`;
        }

        return baseName;
    }

    function buildEmptyProfileForm() {
        return {
            firstName: '',
            lastName: '',
            receiverName: '',
            phone: '',
            addressLine1: '',
            addressLine2: '',
            country: '',
            city: '',
            district: '',
            postalCode: '',
            reference: '',
        };
    }

    function buildProfileForm(profile) {
        if (!profile) {
            return buildEmptyProfileForm();
        }

        const user = profile.user || {};
        const address = profile.address || {};

        return {
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            receiverName: address.receiverName || '',
            phone: address.phone || '',
            addressLine1: address.addressLine1 || '',
            addressLine2: address.addressLine2 || '',
            country: address.country || '',
            city: address.city || '',
            district: address.district || '',
            postalCode: address.postalCode || '',
            reference: address.reference || '',
        };
    }

    function getErrorMessage(payload, fallback) {
        if (payload && Array.isArray(payload.errors) && payload.errors.length) {
            return payload.errors[0].message || fallback;
        }

        if (payload && payload.message) {
            return payload.message;
        }

        return fallback;
    }

    function resolveView(pathname) {
        if (!pathname || pathname === '/') {
            return 'home';
        }

        if (pathname === '/login') {
            return 'login';
        }

        if (pathname === '/register') {
            return 'register';
        }

        if (pathname === '/profile') {
            return 'profile';
        }

        return 'home';
    }

    function App() {
        const [variants, setVariants] = useState([]);
        const [status, setStatus] = useState('idle');
        const [error, setError] = useState('');
        const [selected, setSelected] = useState(null);
        const [detailStatus, setDetailStatus] = useState('idle');
        const [detailError, setDetailError] = useState('');

        const [authToken, setAuthToken] = useState(
            () => window.localStorage.getItem('authToken') || ''
        );
        const [loginForm, setLoginForm] = useState({ email: '', password: '' });
        const [loginStatus, setLoginStatus] = useState('idle');
        const [loginError, setLoginError] = useState('');

        const [registerForm, setRegisterForm] = useState({
            email: '',
            password: '',
        });
        const [registerStatus, setRegisterStatus] = useState('idle');
        const [registerError, setRegisterError] = useState('');

        const [profileForm, setProfileForm] = useState(buildEmptyProfileForm());
        const [profileStatus, setProfileStatus] = useState('idle');
        const [profileError, setProfileError] = useState('');
        const [profileMessage, setProfileMessage] = useState('');
        const [view, setView] = useState(resolveView(window.location.pathname));

        const isLoggedIn = Boolean(authToken);

        useEffect(() => {
            loadVariants();
        }, []);

        useEffect(() => {
            const handlePopState = () => {
                setView(resolveView(window.location.pathname));
            };

            window.addEventListener('popstate', handlePopState);
            return () => window.removeEventListener('popstate', handlePopState);
        }, []);

        useEffect(() => {
            if (!window.location.hash) {
                return;
            }

            const hashValue = window.location.hash.startsWith('#')
                ? window.location.hash.slice(1)
                : window.location.hash;
            const params = new URLSearchParams(hashValue);
            const token = params.get('token');
            const errorParam = params.get('error');

            if (token) {
                window.localStorage.setItem('authToken', token);
                setAuthToken(token);
                window.history.replaceState({}, '', window.location.pathname);
                navigate('/profile');
                return;
            }

            if (errorParam) {
                setLoginError(errorParam);
                setRegisterError(errorParam);
                window.history.replaceState({}, '', window.location.pathname);
            }
        }, []);

        useEffect(() => {
            if (authToken) {
                loadProfile();
            } else {
                setProfileForm(buildEmptyProfileForm());
            }
        }, [authToken]);

        function navigate(path) {
            if (!path) {
                return;
            }

            if (window.location.pathname !== path) {
                window.history.pushState({}, '', path);
            }

            setView(resolveView(path));
        }

        function handleNavClick(event, path) {
            event.preventDefault();
            navigate(path);
        }

        function handleGoogleLogin() {
            const url = buildApiUrl('/api/v1/auth/google');
            window.location.assign(url);
        }

        function saveSession(data) {
            if (!data || !data.token) {
                return;
            }

            window.localStorage.setItem('authToken', data.token);
            setAuthToken(data.token);
            navigate('/profile');
        }

        function clearSession() {
            window.localStorage.removeItem('authToken');
            setAuthToken('');
            setProfileForm(buildEmptyProfileForm());
            navigate('/');
        }

        async function loadVariants() {
            setStatus('loading');
            setError('');
            try {
                const response = await fetch(
                    buildApiUrl('/api/v1/catalog/variants?page=1&pageSize=12')
                );
                if (!response.ok) {
                    throw new Error('No se pudo cargar el catálogo de productos.');
                }

                const payload = await response.json();
                setVariants(Array.isArray(payload.data) ? payload.data : []);
            } catch (err) {
                setError(err.message || 'Error al cargar el catálogo.');
            } finally {
                setStatus('idle');
            }
        }

        async function loadVariantDetail(sku) {
            setDetailStatus('loading');
            setDetailError('');
            try {
                const response = await fetch(buildApiUrl(`/api/v1/catalog/variants/${sku}`));
                if (!response.ok) {
                    throw new Error('No se pudo cargar el producto.');
                }

                const payload = await response.json();
                setSelected(payload.data || null);
            } catch (err) {
                setDetailError(err.message || 'Error al cargar el producto.');
            } finally {
                setDetailStatus('idle');
            }
        }

        async function handleLogin(event) {
            event.preventDefault();
            setLoginStatus('loading');
            setLoginError('');
            try {
                const response = await fetch(buildApiUrl('/api/v1/auth/login'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: loginForm.email,
                        password: loginForm.password,
                    }),
                });

                const payload = await response.json().catch(() => ({}));
                if (!response.ok) {
                    throw new Error(
                        getErrorMessage(payload, 'No se pudo iniciar sesión.')
                    );
                }

                saveSession(payload.data);
                setLoginForm({ email: '', password: '' });
            } catch (err) {
                setLoginError(err.message || 'No se pudo iniciar sesión.');
            } finally {
                setLoginStatus('idle');
            }
        }

        async function handleRegister(event) {
            event.preventDefault();
            setRegisterStatus('loading');
            setRegisterError('');
            try {
                const response = await fetch(buildApiUrl('/api/v1/auth/register'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: registerForm.email,
                        password: registerForm.password,
                    }),
                });

                const payload = await response.json().catch(() => ({}));
                if (!response.ok) {
                    throw new Error(
                        getErrorMessage(payload, 'No se pudo registrar el usuario.')
                    );
                }

                saveSession(payload.data);
                setRegisterForm({ email: '', password: '' });
            } catch (err) {
                setRegisterError(err.message || 'No se pudo registrar el usuario.');
            } finally {
                setRegisterStatus('idle');
            }
        }

        async function loadProfile() {
            if (!authToken) {
                return;
            }

            setProfileStatus('loading');
            setProfileError('');
            setProfileMessage('');
            try {
                const response = await fetch(buildApiUrl('/api/v1/profile'), {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                const payload = await response.json().catch(() => ({}));
                if (!response.ok) {
                    if (response.status === 401) {
                        clearSession();
                        throw new Error('Sesión expirada.');
                    }

                    throw new Error(getErrorMessage(payload, 'No se pudo cargar el perfil.'));
                }

                setProfileForm(buildProfileForm(payload.data));
            } catch (err) {
                setProfileError(err.message || 'Error al cargar el perfil.');
            } finally {
                setProfileStatus('idle');
            }
        }

        function buildProfilePayload() {
            const payload = {};
            const firstName = profileForm.firstName.trim();
            const lastName = profileForm.lastName.trim();

            if (firstName) {
                payload.firstName = firstName;
            }

            if (lastName) {
                payload.lastName = lastName;
            }

            const address = {
                receiverName: profileForm.receiverName.trim(),
                phone: profileForm.phone.trim(),
                addressLine1: profileForm.addressLine1.trim(),
                addressLine2: profileForm.addressLine2.trim(),
                country: profileForm.country.trim(),
                city: profileForm.city.trim(),
                district: profileForm.district.trim(),
                postalCode: profileForm.postalCode.trim(),
                reference: profileForm.reference.trim(),
            };

            const hasAddressData = Object.values(address).some((value) => value);
            if (hasAddressData) {
                payload.address = address;
            }

            return payload;
        }

        async function handleProfileSave(event) {
            event.preventDefault();
            if (!authToken) {
                return;
            }

            const payload = buildProfilePayload();
            if (!payload.firstName && !payload.lastName && !payload.address) {
                setProfileError('No hay cambios para guardar.');
                return;
            }

            setProfileStatus('loading');
            setProfileError('');
            setProfileMessage('');
            try {
                const response = await fetch(buildApiUrl('/api/v1/profile'), {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                    body: JSON.stringify(payload),
                });

                const body = await response.json().catch(() => ({}));
                if (!response.ok) {
                    throw new Error(getErrorMessage(body, 'No se pudo guardar el perfil.'));
                }

                setProfileForm(buildProfileForm(body.data));
                setProfileMessage('Perfil actualizado correctamente.');
            } catch (err) {
                setProfileError(err.message || 'Error al guardar el perfil.');
            } finally {
                setProfileStatus('idle');
            }
        }

        const cards = variants.map((variant) =>
            createElement(
                'article',
                { className: 'card', key: variant.sku },
                createElement('h3', { className: 'card__title' }, getVariantTitle(variant)),
                createElement('p', { className: 'card__meta' }, `SKU: ${variant.sku}`),
                createElement('p', { className: 'card__meta' }, formatPrice(variant.price)),
                createElement(
                    'p',
                    { className: 'card__meta' },
                    `Stock disponible: ${variant.stockAvailable}`
                ),
                createElement(
                    'button',
                    {
                        className: 'button button--ghost',
                        type: 'button',
                        onClick: () => loadVariantDetail(variant.sku),
                    },
                    'Ver detalle'
                )
            )
        );

        const isLoginView = view === 'login';
        const isRegisterView = view === 'register';
        const isProfileView = view === 'profile';
        const isHomeView = view === 'home';

        return createElement(
            'main',
            { className: 'app' },
            createElement(
                'header',
                { className: 'header' },
                createElement(
                    'a',
                    {
                        className: 'header__title',
                        href: '/',
                        onClick: (event) => handleNavClick(event, '/'),
                    },
                    'Spacegurumis'
                ),
                createElement(
                    'nav',
                    { className: 'nav' },
                    !isLoggedIn
                        ? createElement(
                            'button',
                            {
                                className: 'button button--ghost',
                                type: 'button',
                                onClick: () => navigate('/register'),
                            },
                            'Registrarse'
                        )
                        : null,
                    !isLoggedIn
                        ? createElement(
                            'button',
                            {
                                className: 'button button--primary',
                                type: 'button',
                                onClick: () => navigate('/login'),
                            },
                            'Iniciar sesión'
                        )
                        : null,
                    isLoggedIn
                        ? createElement(
                            'button',
                            {
                                className: 'button button--ghost',
                                type: 'button',
                                onClick: () => navigate('/profile'),
                            },
                            'Perfil'
                        )
                        : null,
                    isLoggedIn
                        ? createElement(
                            'button',
                            {
                                className: 'button button--danger',
                                type: 'button',
                                onClick: clearSession,
                            },
                            'Cerrar sesión'
                        )
                        : null
                )
            ),
            isHomeView
                ? createElement(
                    'p',
                    { className: 'lead' },
                    'Catálogo de productos disponibles.'
                )
                : null,
            isLoginView || isRegisterView
                ? createElement(
                    'section',
                    { className: 'auth auth--page' },
                    createElement(
                        'div',
                        { className: 'auth__header' },
                        createElement(
                            'h2',
                            { className: 'section-title' },
                            isLoginView ? 'Iniciar sesión' : 'Crear cuenta'
                        ),
                        createElement(
                            'p',
                            { className: 'section-note' },
                            isLoginView
                                ? 'Ingresa con tu email o usa Google.'
                                : 'Completa tu nombre luego desde el perfil.'
                        )
                    ),
                    createElement(
                        'div',
                        { className: 'auth__actions' },
                        createElement(
                            'button',
                            {
                                className: 'button button--dark',
                                type: 'button',
                                onClick: handleGoogleLogin,
                            },
                            'Continuar con Google'
                        )
                    ),
                    isRegisterView
                        ? createElement(
                            'form',
                            { className: 'form', onSubmit: handleRegister },
                            createElement(
                                'label',
                                { className: 'field' },
                                createElement('span', { className: 'field__label' }, 'Email'),
                                createElement('input', {
                                    className: 'field__input',
                                    type: 'email',
                                    required: true,
                                    value: registerForm.email,
                                    onChange: (event) =>
                                        setRegisterForm((prev) => ({
                                            ...prev,
                                            email: event.target.value,
                                        })),
                                })
                            ),
                            createElement(
                                'label',
                                { className: 'field' },
                                createElement('span', { className: 'field__label' }, 'Contraseña'),
                                createElement('input', {
                                    className: 'field__input',
                                    type: 'password',
                                    required: true,
                                    minLength: 6,
                                    value: registerForm.password,
                                    onChange: (event) =>
                                        setRegisterForm((prev) => ({
                                            ...prev,
                                            password: event.target.value,
                                        })),
                                })
                            ),
                            registerError
                                ? createElement(
                                    'p',
                                    { className: 'status status--error' },
                                    registerError
                                )
                                : null,
                            createElement(
                                'button',
                                {
                                    className: 'button button--primary',
                                    type: 'submit',
                                    disabled: registerStatus === 'loading',
                                },
                                registerStatus === 'loading'
                                    ? 'Registrando...'
                                    : 'Crear cuenta'
                            )
                        )
                        : createElement(
                            'form',
                            { className: 'form', onSubmit: handleLogin },
                            createElement(
                                'label',
                                { className: 'field' },
                                createElement('span', { className: 'field__label' }, 'Email'),
                                createElement('input', {
                                    className: 'field__input',
                                    type: 'email',
                                    required: true,
                                    value: loginForm.email,
                                    onChange: (event) =>
                                        setLoginForm((prev) => ({
                                            ...prev,
                                            email: event.target.value,
                                        })),
                                })
                            ),
                            createElement(
                                'label',
                                { className: 'field' },
                                createElement('span', { className: 'field__label' }, 'Contraseña'),
                                createElement('input', {
                                    className: 'field__input',
                                    type: 'password',
                                    required: true,
                                    minLength: 6,
                                    value: loginForm.password,
                                    onChange: (event) =>
                                        setLoginForm((prev) => ({
                                            ...prev,
                                            password: event.target.value,
                                        })),
                                })
                            ),
                            loginError
                                ? createElement(
                                    'p',
                                    { className: 'status status--error' },
                                    loginError
                                )
                                : null,
                            createElement(
                                'button',
                                {
                                    className: 'button button--primary',
                                    type: 'submit',
                                    disabled: loginStatus === 'loading',
                                },
                                loginStatus === 'loading'
                                    ? 'Ingresando...'
                                    : 'Ingresar'
                            )
                        ),
                    createElement(
                        'div',
                        { className: 'auth__switch' },
                        createElement(
                            'span',
                            null,
                            isLoginView ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'
                        ),
                        createElement(
                            'button',
                            {
                                className: 'button button--ghost',
                                type: 'button',
                                onClick: () =>
                                    navigate(isLoginView ? '/register' : '/login'),
                            },
                            isLoginView ? 'Registrarse' : 'Iniciar sesión'
                        )
                    )
                )
                : null,
            isProfileView
                ? createElement(
                    'section',
                    { className: 'profile' },
                    createElement('h2', { className: 'section-title' }, 'Perfil'),
                    !isLoggedIn
                        ? createElement(
                            'div',
                            { className: 'auth__actions' },
                            createElement(
                                'p',
                                { className: 'status' },
                                'Inicia sesión para ver tu perfil.'
                            ),
                            createElement(
                                'button',
                                {
                                    className: 'button button--primary',
                                    type: 'button',
                                    onClick: () => navigate('/login'),
                                },
                                'Ir a login'
                            )
                        )
                        : createElement(
                            'form',
                            { className: 'form form--wide', onSubmit: handleProfileSave },
                        createElement(
                            'div',
                            { className: 'form__grid' },
                            createElement(
                                'label',
                                { className: 'field' },
                                createElement('span', { className: 'field__label' }, 'Nombre'),
                                createElement('input', {
                                    className: 'field__input',
                                    type: 'text',
                                    value: profileForm.firstName,
                                    onChange: (event) =>
                                        setProfileForm((prev) => ({
                                            ...prev,
                                            firstName: event.target.value,
                                        })),
                                })
                            ),
                            createElement(
                                'label',
                                { className: 'field' },
                                createElement('span', { className: 'field__label' }, 'Apellido'),
                                createElement('input', {
                                    className: 'field__input',
                                    type: 'text',
                                    value: profileForm.lastName,
                                    onChange: (event) =>
                                        setProfileForm((prev) => ({
                                            ...prev,
                                            lastName: event.target.value,
                                        })),
                                })
                            ),
                            createElement(
                                'label',
                                { className: 'field' },
                                createElement('span', { className: 'field__label' }, 'Receptor'),
                                createElement('input', {
                                    className: 'field__input',
                                    type: 'text',
                                    value: profileForm.receiverName,
                                    onChange: (event) =>
                                        setProfileForm((prev) => ({
                                            ...prev,
                                            receiverName: event.target.value,
                                        })),
                                })
                            ),
                            createElement(
                                'label',
                                { className: 'field' },
                                createElement('span', { className: 'field__label' }, 'Teléfono'),
                                createElement('input', {
                                    className: 'field__input',
                                    type: 'text',
                                    value: profileForm.phone,
                                    onChange: (event) =>
                                        setProfileForm((prev) => ({
                                            ...prev,
                                            phone: event.target.value,
                                        })),
                                })
                            ),
                            createElement(
                                'label',
                                { className: 'field' },
                                createElement('span', { className: 'field__label' }, 'Dirección'),
                                createElement('input', {
                                    className: 'field__input',
                                    type: 'text',
                                    value: profileForm.addressLine1,
                                    onChange: (event) =>
                                        setProfileForm((prev) => ({
                                            ...prev,
                                            addressLine1: event.target.value,
                                        })),
                                })
                            ),
                            createElement(
                                'label',
                                { className: 'field' },
                                createElement('span', { className: 'field__label' }, 'Referencia'),
                                createElement('input', {
                                    className: 'field__input',
                                    type: 'text',
                                    value: profileForm.reference,
                                    onChange: (event) =>
                                        setProfileForm((prev) => ({
                                            ...prev,
                                            reference: event.target.value,
                                        })),
                                })
                            ),
                            createElement(
                                'label',
                                { className: 'field' },
                                createElement('span', { className: 'field__label' }, 'Dirección 2'),
                                createElement('input', {
                                    className: 'field__input',
                                    type: 'text',
                                    value: profileForm.addressLine2,
                                    onChange: (event) =>
                                        setProfileForm((prev) => ({
                                            ...prev,
                                            addressLine2: event.target.value,
                                        })),
                                })
                            ),
                            createElement(
                                'label',
                                { className: 'field' },
                                createElement('span', { className: 'field__label' }, 'Distrito'),
                                createElement('input', {
                                    className: 'field__input',
                                    type: 'text',
                                    value: profileForm.district,
                                    onChange: (event) =>
                                        setProfileForm((prev) => ({
                                            ...prev,
                                            district: event.target.value,
                                        })),
                                })
                            ),
                            createElement(
                                'label',
                                { className: 'field' },
                                createElement('span', { className: 'field__label' }, 'Ciudad'),
                                createElement('input', {
                                    className: 'field__input',
                                    type: 'text',
                                    value: profileForm.city,
                                    onChange: (event) =>
                                        setProfileForm((prev) => ({
                                            ...prev,
                                            city: event.target.value,
                                        })),
                                })
                            ),
                            createElement(
                                'label',
                                { className: 'field' },
                                createElement('span', { className: 'field__label' }, 'País'),
                                createElement('input', {
                                    className: 'field__input',
                                    type: 'text',
                                    value: profileForm.country,
                                    onChange: (event) =>
                                        setProfileForm((prev) => ({
                                            ...prev,
                                            country: event.target.value,
                                        })),
                                })
                            ),
                            createElement(
                                'label',
                                { className: 'field' },
                                createElement(
                                    'span',
                                    { className: 'field__label' },
                                    'Código postal'
                                ),
                                createElement('input', {
                                    className: 'field__input',
                                    type: 'text',
                                    value: profileForm.postalCode,
                                    onChange: (event) =>
                                        setProfileForm((prev) => ({
                                            ...prev,
                                            postalCode: event.target.value,
                                        })),
                                })
                            )
                        ),
                        profileError
                            ? createElement(
                                'p',
                                { className: 'status status--error' },
                                profileError
                            )
                            : null,
                        profileMessage
                            ? createElement(
                                'p',
                                { className: 'status status--success' },
                                profileMessage
                            )
                            : null,
                        createElement(
                            'button',
                            {
                                className: 'button button--primary',
                                type: 'submit',
                                disabled: profileStatus === 'loading',
                            },
                            profileStatus === 'loading'
                                ? 'Guardando...'
                                : 'Guardar perfil'
                        )
                    )
                )
                : null,
            isHomeView
                ? createElement(
                    'div',
                    null,
                    error
                        ? createElement('p', { className: 'status status--error' }, error)
                        : null,
                    status === 'loading'
                        ? createElement('p', { className: 'status' }, 'Cargando catálogo...')
                        : null,
                    status === 'idle' && !variants.length
                        ? createElement(
                            'p',
                            { className: 'status' },
                            'No hay productos registrados.'
                        )
                        : null,
                    createElement('section', { className: 'catalog' }, cards),
                    createElement(
                        'section',
                        { className: 'detail' },
                        createElement('h2', null, 'Detalle de producto'),
                        detailError
                            ? createElement(
                                'p',
                                { className: 'status status--error' },
                                detailError
                            )
                            : null,
                        detailStatus === 'loading'
                            ? createElement(
                                'p',
                                { className: 'status' },
                                'Cargando detalle...'
                            )
                            : null,
                        detailStatus === 'idle' && selected
                            ? createElement(
                                'div',
                                { className: 'detail__content' },
                                createElement('h3', null, getVariantTitle(selected)),
                                createElement('p', null, `SKU: ${selected.sku}`),
                                createElement('p', null, formatPrice(selected.price)),
                                createElement(
                                    'p',
                                    null,
                                    `Stock disponible: ${selected.stockAvailable}`
                                ),
                                createElement(
                                    'p',
                                    null,
                                    selected.product && selected.product.description
                                        ? selected.product.description
                                        : 'Sin descripción'
                                )
                            )
                            : createElement(
                                'p',
                                { className: 'status' },
                                'Selecciona un producto para ver el detalle.'
                            )
                    )
                )
                : null
        );
    }

    root.render(createElement(App));
})();
