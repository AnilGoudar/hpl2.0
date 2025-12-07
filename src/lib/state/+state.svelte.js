import Players from '$lib/assets/Icons/players.svg';
import Teams from '$lib/assets/Icons/teams.svg';
import Fixtures from '$lib/assets/Icons/fixtures.svg';
import Home from '$lib/assets/Icons/home.svg';
import Login from '$lib/assets/Icons/login.svg';
import Profile from '$lib/assets/Icons/profile.svg';
import Table from '$lib/assets/Icons/table.svg';

export const loadingState = $state({
	message: '',
	isLoading: false
});

export function startLoading(msg = 'Processing...') {
	loadingState.isLoading = true;
	loadingState.message = msg;
}
export function stopLoading() {
	loadingState.message = '';
	loadingState.isLoading = false;
}
export const userState = $state({
	id: '',
	email: '',
	role: ''
});
export function setUser(data) {
	userState.id = data.id;
	userState.email = data.email;
	userState.role = data.role;
}
export function clearUser() {
	userState.id = '';
	userState.email = '';
	userState.role = '';
}

export const bottomNavLinks = $state([
	{ title: 'Home', href: '/', iconId: Home, path: '' },
	{ title: 'Players', href: '/players', iconId: Players, path: 'players' },
	{ title: 'Teams', href: '/teams', iconId: Teams, path: 'teams' },
	{ title: 'Fixtures', href: '/fixtures', iconId: Fixtures, path: 'fixtures' },
	{ title: 'Login', href: '/login', iconId: Login, path: 'login' },
	{ title: 'Profile', href: '/profile', iconId: Profile, path: 'profile' },
	{ title: 'Points Table', href: '/points', iconId: Table, path: 'points' }
]);

export const staticApiData = $state({
	teams: null,
	playerCategories: null
});

export function setStaticApiData(data) {
	if (!staticApiData.teams && data.teams) {
		staticApiData.teams = data.teams;
	}
	if (!staticApiData.playerCategories && data.playerCategories) {
		staticApiData.playerCategories = data.playerCategories;
	}
}
