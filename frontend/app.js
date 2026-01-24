(function () {
    const { useEffect, useState } = React;
    const rootElement = document.getElementById('root');
    const root = ReactDOM.createRoot(rootElement);
    const createElement = React.createElement;

    function resolveApiBase() {
        if (window.API_BASE_URL) {
            return window.API_BASE_URL;
        }

        const host = window.location.hostname;
        if (!host) {
            return '';
        }

        if (host === 'localhost' || host === '127.0.0.1') {
            return 'http://localhost:3000';
        }

        const protocol = window.location.protocol || 'http:';
        return `${protocol}//${host}:3000`;
    }

    const apiBase = resolveApiBase();

    function buildApiUrl(path) {
        if (!apiBase) {
            return path;
        }

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

    function App() {
        const [variants, setVariants] = useState([]);
        const [status, setStatus] = useState('idle');
        const [error, setError] = useState('');
        const [selected, setSelected] = useState(null);
        const [detailStatus, setDetailStatus] = useState('idle');
        const [detailError, setDetailError] = useState('');

        useEffect(() => {
            loadVariants();
        }, []);

        async function loadVariants() {
            setStatus('loading');
            setError('');
            try {
                const response = await fetch(
                    buildApiUrl('/api/v1/catalog/variants?page=1&pageSize=12')
                );
                if (!response.ok) {
                    throw new Error('No se pudo cargar el catalogo de productos.');
                }

                const payload = await response.json();
                setVariants(Array.isArray(payload.data) ? payload.data : []);
            } catch (err) {
                setError(err.message || 'Error al cargar el catalogo.');
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
                        className: 'card__button',
                        type: 'button',
                        onClick: () => loadVariantDetail(variant.sku),
                    },
                    'Ver detalle'
                )
            )
        );

        return createElement(
            'main',
            { className: 'app' },
            createElement('h1', null, 'Spacegurumis'),
            createElement('p', { className: 'lead' }, 'Catalogo de productos disponibles.'),
            error
                ? createElement('p', { className: 'status status--error' }, error)
                : null,
            status === 'loading'
                ? createElement('p', { className: 'status' }, 'Cargando catalogo...')
                : null,
            status === 'idle' && !variants.length
                ? createElement('p', { className: 'status' }, 'No hay productos registradas.')
                : null,
            createElement('section', { className: 'catalog' }, cards),
            createElement(
                'section',
                { className: 'detail' },
                createElement('h2', null, 'Detalle de producto'),
                detailError
                    ? createElement('p', { className: 'status status--error' }, detailError)
                    : null,
                detailStatus === 'loading'
                    ? createElement('p', { className: 'status' }, 'Cargando detalle...')
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
                                : 'Sin descripcion'
                        )
                    )
                    : createElement(
                        'p',
                        { className: 'status' },
                        'Selecciona un producto para ver el detalle.'
                    )
            )
        );
    }

    root.render(createElement(App));
})();
