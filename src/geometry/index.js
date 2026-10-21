import './styles.css';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkInteractorStyleTrackballCamera from '@kitware/vtk.js/Interaction/Style/InteractorStyleTrackballCamera';
import vtkSphereSource from '@kitware/vtk.js/Filters/Sources/SphereSource';

let pipelineComponents;

export function onMount(root) {
    const vtkCanvas = root.querySelector('vtk-canvas');
    if (!vtkCanvas) {
        throw new Error('Vtk-canvas element is not loaded!');
    }

    const sphereSource = vtkSphereSource.newInstance({
        radius: 5,
        thetaResolution: 30,
        phiResolution: 30,
    });

    const mapper = vtkMapper.newInstance();
    mapper.setInputConnection(sphereSource.getOutputPort());

    const actor = vtkActor.newInstance();
    actor.setMapper(mapper);
    actor.getProperty().setColor(0.2, 0.7, 1.0);
    actor.getProperty().setRepresentationToWireframe();

    const { renderer, renderWindow, interactor } = vtkCanvas.vtkComponents;
    renderer.addActor(actor);
    interactor.setInteractorStyle(vtkInteractorStyleTrackballCamera.newInstance());
    renderer.resetCamera();
    renderWindow.render();

    pipelineComponents = { renderer, sphereSource, mapper, actor };
}

export function onUnmount() {
    if (!pipelineComponents) {
        return;
    }
    // clean up the pipeline components changes from this content page to avoid memory leaks
    const { renderer, sphereSource, mapper, actor } = pipelineComponents;
    renderer.removeActor(actor);
    actor.delete();
    mapper.delete();
    sphereSource.delete();
    pipelineComponents = undefined;
}