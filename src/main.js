import "@kitware/vtk.js/Rendering/Profiles/Geometry";

import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";
import vtkRenderer from "@kitware/vtk.js/Rendering/Core/Renderer";
import vtkRenderWindow from "@kitware/vtk.js/Rendering/Core/RenderWindow";
import vtkOpenGLRenderWindow from "@kitware/vtk.js/Rendering/OpenGL/RenderWindow";
import vtkRenderWindowInteractor from "@kitware/vtk.js/Rendering/Core/RenderWindowInteractor";
import vtkInteractorStyleTrackballCamera from "@kitware/vtk.js/Interaction/Style/InteractorStyleTrackballCamera";
import vtkSphereSource from "@kitware/vtk.js/Filters/Sources/SphereSource";

import "./style.css";

// 1. Create the geometry source.
const sphereSource = vtkSphereSource.newInstance({
  radius: 5,
  thetaResolution: 30,
  phiResolution: 30,
});

// 2. Create the mapper and connect the source.
const mapper = vtkMapper.newInstance();
mapper.setInputConnection(sphereSource.getOutputPort());

// 3. Create the actor and assign its mapper.
const actor = vtkActor.newInstance();
actor.setMapper(mapper);
actor.getProperty().setColor(0.2, 0.7, 1.0);

// 4. Create the renderer.
const renderer = vtkRenderer.newInstance();
renderer.setBackground(0.1, 0.1, 0.15);
renderer.addActor(actor);

// 5. Create the rendering window.
const renderWindow = vtkRenderWindow.newInstance();
renderWindow.addRenderer(renderer);

// 6. Create the browser's WebGL rendering view.
const openGLRenderWindow = vtkOpenGLRenderWindow.newInstance();

openGLRenderWindow.setContainer(document.getElementById("vtk-container"));

renderWindow.addView(openGLRenderWindow);

// 7. Configure the rendering dimensions.
function resize() {
  const container = document.getElementById("vtk-container");

  openGLRenderWindow.setSize(container.clientWidth, container.clientHeight);

  renderWindow.render();
}

window.addEventListener("resize", resize);
resize();

// 8. Set up mouse interaction.
const interactor = vtkRenderWindowInteractor.newInstance();

interactor.setView(openGLRenderWindow);
interactor.initialize();

interactor.setInteractorStyle(vtkInteractorStyleTrackballCamera.newInstance());

// 9. Reset the camera and render the scene.
renderer.resetCamera();
renderWindow.render();
