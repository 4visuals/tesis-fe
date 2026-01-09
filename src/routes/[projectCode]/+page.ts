import { error } from '@sveltejs/kit';

const allowedProjects = new Set(['legacy', 'support', 'socialstory', 'cloud', 'donam']);

export const load = ({ params }) => {
	if (!allowedProjects.has(params.projectCode)) {
		throw error(404, 'Project not found');
	}

	return {
		projectCode: params.projectCode
	};
};
