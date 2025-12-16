var _SHAPE_VERTICES = {
    player: {
        size: { x: 300, y: 300 },
        vertices: [
            { x: 75, y: 0 },     // tip (right point)
            { x: -75, y: -65 },  // top left
            { x: -75, y: 65 }    // bottom left
        ]
    },
    obstacles: {
        rect: {
            size: { x: 200, y: 200 },
            vertices: [{ x: -100, y: 100 }, { x: -100, y: -100 }, { x: 100, y: -100 }, { x: 100, y: 100 }]
        },
        diamond: {
            size: { x: 200, y: 200 },
            vertices: [{ x: -100, y: 0 }, { x: 0, y: -100 }, { x: 100, y: 0 }, { x: 0, y: 100 }]
        },
        triangle: {
            size: { x: 200, y: 200 },
            vertices: [{ x: 100, y: 100 }, { x: -100, y: 100 }, { x: 0, y: -100 }]
        },
        rightTriangle: {
            size: { x: 200, y: 200 },
            vertices: [{ x: 100, y: 100 }, { x: -100, y: 100 }, { x: 100, y: -100 }]
        },
        rightTriangleTop: {
            size: { x: 200, y: 200 },
            vertices: [{ x: 100, y: 100 }, { x: -100, y: 100 }, { x: 0, y: 0 }]
        },
        rightTriangleTop5x: {
            size: { x: 1000, y: 200 },
            vertices: [{ x: -500, y: 100 }, { x: -500, y: 75 }, { x: -400, y: 0 }, { x: -300, y: 75 }, { x: -200, y: 0 }, { x: -100, y: 75 }, { x: 0, y: 0 }, { x: 100, y: 75 }, { x: 200, y: 0 }, { x: 300, y: 75 }, { x: 400, y: 0 }, { x: 500, y: 75 }, { x: 500, y: 100 }]
        },
        thornTopWall: {
            size: { x: 800, y: 600 },
            vertices: [{ x: 400, y: 300 }, { x: 400, y: -100 }, { x: 300, y: -200 }, { x: 200, y: -100 }, { x: 100, y: -200 }, { x: 0, y: -100 }, { x: -100, y: -200 }, { x: -200, y: -100 }, { x: -300, y: -200 }, { x: -400, y: -100 }, { x: -400, y: 300 }]
        },
        wall: {
            size: { x: 1600, y: 1000 },
            vertices: [
                { x: -600, y: 500 }, { x: -700, y: 400 }, { x: -600, y: 300 }, { x: -700, y: 200 },
                { x: -600, y: 100 }, { x: -700, y: 0 }, { x: -600, y: -100 }, { x: -700, y: -200 },
                { x: -600, y: -300 }, { x: -500, y: -400 }, { x: -400, y: -300 }, { x: -300, y: -400 },
                { x: -200, y: -300 }, { x: -100, y: -400 }, { x: 0, y: -300 }, { x: 100, y: -400 },
                { x: 200, y: -300 }, { x: 300, y: -400 }, { x: 400, y: -300 }, { x: 500, y: -400 },
                { x: 600, y: -300 }, { x: 700, y: -200 }, { x: 600, y: -100 }, { x: 700, y: 0 },
                { x: 600, y: 100 }, { x: 700, y: 200 }, { x: 600, y: 300 }, { x: 700, y: 400 },
                { x: 600, y: 500 }
            ]
        },
        smallUpNail: {
            size: { x: 400, y: 200 },
            vertices: [{ x: 200, y: 100 }, { x: -200, y: 100 }, { x: -150, y: 0 }, { x: -50, y: 50 }, { x: 0, y: -100 }, { x: 50, y: 50 }, { x: 150, y: 0 }]
        },
        smallDownNail: {
            size: { x: 400, y: 200 },
            vertices: [{ x: 150, y: 0 }, { x: 50, y: -50 }, { x: 0, y: 100 }, { x: -50, y: -50 }, { x: -150, y: 0 }, { x: -200, y: -100 }, { x: 200, y: -100 }]
        },
        inclinedPillar: {
            size: { x: 600, y: 400 },
            vertices: [{ x: -300, y: 200 }, { x: 100, y: -200 }, { x: 300, y: -200 }, { x: 300, y: 0 }, { x: 100, y: 200 }]
        },
    }
};

ig.module(
    'game.data.shape-vertices'
)
    .requires(
        'impact.entity'
    )
    .defines(function () {
    });
