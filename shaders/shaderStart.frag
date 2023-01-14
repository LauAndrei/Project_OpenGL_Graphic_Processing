#version 410 core

// fragCoords
in vec3 fNormal;
in vec4 fPosEye;
in vec2 fTexCoords;
in vec4 fragPosLightSpace;

out vec4 fColor;

// lighting
uniform	vec3 lightDir;
uniform	vec3 lightColor;

// lighting++
uniform int havePointLight;
uniform int haveDirLight;
uniform vec3 lightPos1;
uniform vec3 lightPos2;
uniform vec3 lightPos3;

// texture
uniform sampler2D diffuseTexture;
uniform sampler2D specularTexture;
uniform sampler2D shadowMap;

// fog
uniform float fogDensity;

// color
vec3 ambient;
float ambientStrength = 0.2f;
float ambientPointStrength = 0.001f;
vec3 diffuse;
vec3 specular;
float specularStrength = 0.5f;
float specularPointStrength = 0.001f;
float shininess = 32.0f;

float constant = 1.0f;
float linear = 0.22f;
float quadratic = 0.20f;

uniform mat4 view;

float computeFog() 
{
	//float fogDensity = 0.05f;
	float fragmentDistance = length(fPosEye);
	float fogFactor = exp(-pow(fragmentDistance * fogDensity, 2));
	return clamp(fogFactor, 0.0f, 1.0f); 
}

float computeShadow()
{
	// perform perspective divide
	vec3 normalizedCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;

	// Transform to [0,1] range
	normalizedCoords = normalizedCoords * 0.5 + 0.5;

	if (normalizedCoords.z > 1.0f)
		return 0.0f;

	// Get closest depth value from light's perspective
	float closestDepth = texture(shadowMap, normalizedCoords.xy).r;

	// Get depth of current fragment from light's perspective
	float currentDepth = normalizedCoords.z;

	// Check whether current frag pos is in shadow
	float bias = 0.005f;
	float shadow = currentDepth - bias > closestDepth ? 1.0 : 0.0;

	return shadow;
	
}

// point light
vec3 computePointLight(vec4 lightPosEye)
{
	vec3 cameraPosEye = vec3(0.0f); //in eye coordinates, the viewer is situated at the origin

	//transform normal
	vec3 normalEye = normalize(fNormal);

	//compute light direction
	vec3 lightDirN = normalize(lightPosEye.xyz - fPosEye.xyz);

	//compute view direction 
	vec3 viewDirN = normalize(cameraPosEye - fPosEye.xyz);

	//compute ambient light
	vec3 ambient = ambientPointStrength * lightColor;

	//compute diffuse light
	vec3 diffuse = max(dot(normalEye, lightDirN), 0.0f) * lightColor;

	//compute half vector
	vec3 halfVector = normalize(lightDirN + viewDirN);

	//compute specular coefficient and specular light
	vec3 reflection = reflect(-lightDirN, normalEye);
	float specCoeff = pow(max(dot(normalEye, halfVector), 0.0f), shininess);
	vec3 specular = specularPointStrength * specCoeff * lightColor;

	float distance = length(lightPosEye.xyz - fPosEye.xyz);
	float att = 1.0f / (constant + linear * distance + quadratic * distance * distance);
	return (ambient + diffuse + specular) * att * vec3(2.0f,2.0f,2.0f);
}

vec3 computeLightComponents()
{		
	vec3 cameraPosEye = vec3(0.0f); //in eye coordinates, the viewer is situated at the origin
	
	//transform normal
	vec3 normalEye = normalize(fNormal);	
	
	//compute light direction
	vec3 lightDirN = normalize(lightDir);
	
	//compute view direction 
	vec3 viewDirN = normalize(cameraPosEye - fPosEye.xyz);
		
	//compute ambient light
	ambient = ambientStrength * lightColor;
	
	//compute diffuse light
	diffuse = max(dot(normalEye, lightDirN), 0.0f) * lightColor;
	
	//compute specular light
	vec3 reflection = reflect(-lightDirN, normalEye);
	float specCoeff = pow(max(dot(viewDirN, reflection), 0.0f), shininess);
	specular = specularStrength * specCoeff * lightColor;

	return ambient + diffuse + specular;
}

void main() 
{
	vec3 initialLight;
	if (haveDirLight == 0) {
		initialLight = computeLightComponents();
	}
	if (haveDirLight == 1) {
		initialLight = computeLightComponents();
	}
	if (haveDirLight == 2) {
		initialLight = vec3(1.0f, 0.0f, 0.0f);
	}
	
	vec4 pointLightPos1 = view * vec4(lightPos1, 1.0f);
	vec4 pointLightPos2 = view * vec4(lightPos2, 1.0f);
	vec4 pointLightPos3 = view * vec4(lightPos3, 1.0f);

	if (havePointLight == 1 || havePointLight == 4) {
		initialLight += computePointLight(pointLightPos1);
	}
	if (havePointLight == 2 || havePointLight == 4) {
		initialLight += computePointLight(pointLightPos2);
	}
	if (havePointLight == 3 || havePointLight == 4) {
		initialLight += computePointLight(pointLightPos3);
	}	

	float fogFactor = computeFog();
	vec4 fogColor = vec4(0.5f, 0.5f, 0.5f, 1.0f);
	vec3 baseColor = vec3(0.9f, 0.35f, 0.0f); //orange
	
	ambient *= texture(diffuseTexture, fTexCoords).rgb;
	diffuse *= texture(diffuseTexture, fTexCoords).rgb;
	specular *= texture(specularTexture, fTexCoords).rgb;

	float shadow = computeShadow();
	vec3 color = min((ambient + (1.0f - shadow)*diffuse) + (1.0f - shadow)*specular, 1.0f);
	vec4 colorVec = vec4(color * initialLight, 1.0f);
	fColor = mix(fogColor, colorVec, fogFactor);
}
