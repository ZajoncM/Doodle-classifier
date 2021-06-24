let dataObjectsArray = [];

let dataPreload = [];

let model;

xs = {};
ys = {};
testing_xs = {};
testing_ys = {};

const numberOfEachDoodle = 1000;
const data_proportion = 0.8;
function preload() {
  let filename;
  for (let i = 0; i < doodleLabelList.length; i++) {
    filename = doodleLabelList[i].toLowerCase();
    dataPreload[i] = loadBytes("./datasets/" + filename + ".bin");
  }
}

async function setup() {
  let canvas = createCanvas(280, 280);
  canvas.parent("canvas");
  background(0);
  initializeData();

  let rTensors = prepareData(training_data, training_labels);
  xs = rTensors[0];
  ys = rTensors[1];
  rTensors = prepareData(testing_data, testing_labels);
  testing_xs = rTensors[0];
  testing_ys = rTensors[1];

  model = buildModel();

  let trainButton = select("#train");
  let trainingAlert = document.getElementById("training-alert");
  trainingAlert.style.display = "none";

  trainButton.mousePressed(

    () => {
      trainingAlert.style.display = "inline";


      train(trainingAlert).then(async () => {

        trainingAlert.style.display = "none";
        trainingAlert.className = "btn btn-disabled";

      });
    }
  );



  let guessButton = select("#guess");

  guessButton.mousePressed(function () {
    let inputs = [];
    let inputImage = [];
    let img = get();
    img.resize(28, 28);
    img.loadPixels();

    for (let i = 0; i < dataLength; i++) {
      let alpha = img.pixels[i * 4];
      inputs[i] = alpha / 255.0;
    }

    inputImage[0] = inputs;


    let tensorToPredict = tf.tensor2d(inputImage);

    let guess = model.predict(tensorToPredict);
    let argMax = guess.argMax(1);
    let classifiedLabel = argMax.dataSync()[0];

    let classifiedDoodleLabel = doodleLabelList[classifiedLabel];
    const output = select("#output");
    output.html(classifiedDoodleLabel + "!!!");

  });

  let clearButton = select("#clear");
  clearButton.mousePressed(function () {
    background(0);
  });

  let generateButton = select("#generate");

  generateButton.mousePressed(function () {
    background(0);
    let randomIndex = floor(
      random(
        numberOfEachDoodle * doodleLabelList.length * (1 - data_proportion)
      )
    );
    let offset = randomIndex * dataLength;
    let doodlePixels = testing_xs
      .dataSync()
      .subarray(offset, offset + dataLength);
    let otherOffset = randomIndex * doodleLabelList.length;
    let labelsResult = testing_ys
      .dataSync()
      .subarray(otherOffset, otherOffset + doodleLabelList.length);
    let doodleIndex;
    for (let i = 0; i < labelsResult.length; i++) {
      if (labelsResult[i] === 1) {
        doodleIndex = i;
      }
    }

    let img = createImage(28, 28);
    img.loadPixels();
    for (let i = 0; i < dataLength; i++) {
      let val = doodlePixels[i] * 255;
      img.pixels[i * 4 + 0] = val;
      img.pixels[i * 4 + 1] = val;
      img.pixels[i * 4 + 2] = val;
      img.pixels[i * 4 + 3] = 255;
    }
    img.updatePixels();
    img.resize(280, 280);
    image(img, 0, 0);
  });
}

function draw() {
  strokeWeight(8);
  stroke(255);
  if (mouseIsPressed) {
    line(pmouseX, pmouseY, mouseX, mouseY);
  }
}
