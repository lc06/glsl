#version 300 es

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_mouse;

out vec4 FragColor;

float count = 30.0;
float freq = 2. / 1.;
float loop = 100.;

vec2 dire[3] = vec2[3](vec2(1., 0.), vec2(1., 1.), vec2(0., 1.));

float paintGrid(vec2 uv) {
    return (step(0.0, fract(uv.x)) - step(0.1, fract(uv.x))) * 
           (step(0.0, fract(uv.y)) - step(0.1, fract(uv.y)));
}

float rndTime() {
    return mod(floor(u_time * freq), loop);
}

float random (vec2 uv) {
    uv = floor(uv);
    return round(fract(rndTime() * sin(dot(uv.xy, vec2(12.9898,78.233))) * 
           43758.5453123));
}

float linex(vec2 grid, vec2 uv, float off) {
    
    return  
            (step(grid.x + off, uv.x + 0.01) -
            step(grid.x + off, uv.x - 0.02)) *
            
            (step(grid.x, uv.x) - step(grid.x + 1., uv.x))
            * (step(grid.y, uv.y) - step(grid.y + 1., uv.y));
}

float liney(vec2 grid, vec2 uv, float off) {
    
    return  
            (step(grid.y + off, uv.y + 0.01) -
            step(grid.y + off, uv.y - 0.02)) *
            
            (step(grid.x, uv.x) - step(grid.x + 1., uv.x))
            * (step(grid.y, uv.y) - step(grid.y + 1., uv.y));
}

float linexy(vec2 grid, vec2 uv, float off) {
    
    return  
            (step(uv.x + (grid.y - grid.x) - off, uv.y + 0.01)
            - step(uv.x + (grid.y - grid.x) - off, uv.y - 0.02)) *
            
            (step(grid.x, uv.x) - step(grid.x + 1., uv.x))
            * (step(grid.y, uv.y) - step(grid.y + 1., uv.y));
}

float lineyx(vec2 grid, vec2 uv, float off) {
    
    return  
            (step(-uv.x + grid.x + grid.y + 1. + off, uv.y +  + 0.01)
            - step(off, uv.y + uv.x - grid.x - grid.y - 1. - 0.02)) *
            
            (step(grid.x, uv.x) - step(grid.x + 1., uv.x))
            * (step(grid.y, uv.y) - step(grid.y + 1., uv.y));
}

float getState(vec2 uv, float[4] rnd) {
    
    int index = int(rnd[0] + rnd[1] * 2. + rnd[2] * 4. + rnd[3] * 8.);
    float res;

    vec2 floor_uv = floor(uv);

    switch (index) {
        case 0:
        case 15:
            break;
        case 1:
        case 14:
            res = lineyx(floor_uv, uv, -0.5);
            break;
        case 2:
        case 13:
            res = linexy(floor_uv, uv, 0.5);
            break;
        case 3:
        case 12:
            res = liney(floor_uv, uv, 0.5);
            break;
        case 4:
        case 11:
            res = lineyx(floor_uv, uv, 0.5);
            break;
        case 5:
            res = linexy(floor_uv, uv, -0.5) + linexy(floor_uv, uv, 0.5);
            break;
        case 6:
        case 9:
            res = linex(floor_uv, uv, 0.5);
            break;
        case 7:
        case 8:
            res = linexy(floor_uv, uv, -0.5);
            break;
        case 10:
            res = lineyx(floor_uv, uv, -0.5) + lineyx(floor_uv, uv, 0.5);
            break;
    }

    return res;
}

void main() {

    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv.x = uv.x * u_resolution.x / u_resolution.y;

    uv *= count;

    vec3 color = vec3(1., 1., 1.);
    float grid = paintGrid(uv);

    color *= grid;

    float rnd[4] = float[4](random(uv), random(uv + dire[0]), 
                            random(uv + dire[1]), random(uv + dire[2]));
    
    color.x *= rnd[0];
    color += (1. - color) * getState(uv, rnd) * vec3(1., 1., 0.);

    FragColor = vec4(color, 1.);
}