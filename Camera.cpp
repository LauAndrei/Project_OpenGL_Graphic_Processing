#include "Camera.hpp"

namespace gps {

	//Camera constructor
	Camera::Camera(glm::vec3 cameraPosition, glm::vec3 cameraTarget, glm::vec3 cameraUp) {
		this->cameraPosition = cameraPosition;
		this->cameraTarget = cameraTarget;

		this->cameraFrontDirection = glm::normalize(cameraPosition - cameraTarget);
		this->cameraRightDirection = glm::normalize(glm::cross(cameraUp, cameraFrontDirection));
		this->cameraUpDirection = glm::cross(cameraFrontDirection, cameraRightDirection);
	}

	//return the view matrix, using the glm::lookAt() function
	glm::mat4 Camera::getViewMatrix() {
		return glm::lookAt(cameraPosition, cameraPosition + cameraFrontDirection, cameraUpDirection);
	}

	glm::vec3 Camera::getCameraPosition() {
		return this->cameraPosition;
	}

	glm::vec3 Camera::getCameraTarget() {
		return this->cameraTarget;
	}

	//update the camera internal parameters following a camera move event
	void Camera::move(MOVE_DIRECTION direction, float speed) {
		switch (direction)
		{
		case MOVE_FORWARD:
			if ((cameraPosition + cameraFrontDirection * speed).y > 4) {
				cameraPosition += cameraFrontDirection * speed;
				cameraTarget += cameraFrontDirection * speed;
			}
			break;
		case MOVE_BACKWARD:
			if ((cameraPosition - cameraFrontDirection * speed).y > 4) {
				cameraPosition -= cameraFrontDirection * speed;
				cameraTarget -= cameraFrontDirection * speed;
			}
			break;
		case MOVE_LEFT:
			cameraPosition -= cameraRightDirection * speed;
			cameraTarget -= cameraRightDirection * speed;
			break;
		case MOVE_RIGHT:
			cameraPosition += cameraRightDirection * speed;
			cameraTarget += cameraRightDirection * speed;
			break;
		case MOVE_UP:
			cameraPosition += cameraUpDirection * speed;
			cameraTarget += cameraUpDirection * speed;
			break;
		case MOVE_DOWN:
			cameraPosition -= cameraUpDirection * speed;
			cameraTarget -= cameraUpDirection * speed;
			break;

		case TURN_LEFT:
			////cameraTarget += cameraRightDirection * speed;
			//cameraFrontDirection += cameraRightDirection * speed;
			break;

		case TURN_RIGHT:
			////cameraTarget -= cameraRightDirection * speed;
			//cameraFrontDirection -= cameraRightDirection * speed;
			break;
		}
	}

	//update the camera internal parameters following a camera rotate event			   
	//yaw - camera rotation around the y axis
	//pitch - camera rotation around the x axis
	float actualPitch = 0.0f;
	float actualYaw = 0.0f;
	void Camera::rotate(float pitch, float yaw) {
		actualPitch += pitch;
		actualYaw += yaw;
		if (actualPitch > 89.0f) {
			actualPitch = 89.0f;
		}
		if (actualYaw < -89.0f) {
			actualYaw = -89.0f;
		}

		cameraTarget.x = cameraPosition.x + sin(glm::radians(actualYaw));
		cameraTarget.z = cameraPosition.z - cos(glm::radians(actualYaw));
		cameraTarget.y = cameraPosition.y + sin(glm::radians(actualPitch));
		cameraTarget.x = cameraPosition.x + sin(glm::radians(actualYaw)) * cos(glm::radians(actualPitch));
		cameraTarget.z = cameraPosition.z - cos(glm::radians(actualYaw)) * cos(glm::radians(actualPitch));

		cameraFrontDirection = glm::normalize(cameraTarget - cameraPosition);
		cameraRightDirection = glm::normalize(glm::cross(cameraFrontDirection, cameraUpDirection));
	}
}