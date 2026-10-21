import './shared/vtk-canvas.js';
const examplePages = import.meta.glob('./*/index.htm', {
    import: 'default',
    query: '?raw',
});
const exampleModules = import.meta.glob('./*/index.js');

document.addEventListener('DOMContentLoaded', function () {
    const navList = document.querySelector('nav ul');
    const contentDiv = document.querySelector('content');
    let activeExample;

    navList.addEventListener('click', (event) => {
        const link = event.target instanceof Element
            ? event.target.closest('a[href^="#"]')
            : null;
        if (!link || !navList.contains(link)) {
            return;
        }

        event.preventDefault();
        navList.querySelectorAll('a.active').forEach((activeLink) => {
            activeLink.classList.remove('active');
        });
        link.classList.add('active');
        loadSectionContent(link.getAttribute('href').slice(1));
    });

    async function loadSectionContent(sectionId) {
        try {
            await activeExample?.onUnmount?.();
            activeExample = undefined;

            const contentPath = `./${sectionId}/index.htm`;
            const modulePath = `./${sectionId}/index.js`;
            const loadPage = examplePages[contentPath];
            if (!loadPage) {
                throw new Error(`Unknown example section: ${sectionId}`);
            }

            contentDiv.innerHTML = await loadPage();
            const loadModule = exampleModules[modulePath];
            if (loadModule) {
                activeExample = await loadModule();
                await activeExample.onMount?.(contentDiv);
            }
        } catch (error) {
            console.error('Error loading section content:', error);
            contentDiv.innerHTML = `<p>Error loading content for ${sectionId}.</p>`;
        }
    }
});
