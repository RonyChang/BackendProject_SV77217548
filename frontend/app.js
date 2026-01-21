(function () {
    const rootElement = document.getElementById('root');
    const root = ReactDOM.createRoot(rootElement);

    root.render(
        React.createElement(
            'main',
            { className: 'app' },
            React.createElement('h1', null, 'Spacegurumis'),
            React.createElement(
                'p',
                null,
                'Amigurumis de otro mundo.'
            )
        )
    );
})();
