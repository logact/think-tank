import * as React from 'react';
import { HashRouter, Routes, Route } from "react-router-dom";


import { createRoot } from 'react-dom/client';
import Home from './home';
import { Diagram } from './diagram';

const root = createRoot(document.getElementById("app") as HTMLDivElement);
const App = () => {
    return <div style={{ width: '100%', height: '100%' }}>
        <HashRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="diagram/:id" element={<Diagram />} />
                <Route path="diagram" element={<Diagram />} />
            </Routes>
        </HashRouter>
    </div>

}
root.render(<App />);
