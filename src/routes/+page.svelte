<script lang="ts">
	type ProjectLink = { projectName: string; projectCode: string };

	let id = '';
	let pass = '';
	let errorVisible = false;
	let loading = false;
	let projects: ProjectLink[] = [];
	let passInput: HTMLInputElement | null = null;

	const apiBase = import.meta.env.VITE_API_BASE ?? '';

	const resetError = () => {
		errorVisible = false;
	};

	const submitLogin = async () => {
		if (loading) return;
		loading = true;
		errorVisible = false;

		try {
			const body = new URLSearchParams({ id, pass });
			const response = await fetch(`${apiBase}/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body,
				credentials: 'include'
			});

			if (!response.ok) {
				throw new Error(`Login failed: ${response.status}`);
			}

			const data = await response.json();
			if (data?.success) {
				projects = Array.isArray(data.projects) ? data.projects : [];
				if (typeof localStorage !== 'undefined') {
					localStorage.setItem('projects', JSON.stringify(projects));
				}
			} else {
				errorVisible = true;
				passInput?.select();
				passInput?.focus();
			}
		} catch (error) {
			console.error(error);
			errorVisible = true;
			passInput?.select();
			passInput?.focus();
		} finally {
			loading = false;
		}
	};
</script>

<div class="container-fluid">
	<div class="row">
		<div class="col-3"></div>
		<div class="col-6">
			<div class="jumbotron">
				<h1 class="display-4">로그인</h1>
				<p class="lead">서울경인특수학급교사연구회</p>
				<hr class="my-4" />
				<p>교수학습지원자료 및 연구자료를 함께하는 곳</p>
			</div>

			{#if projects.length === 0}
				<form id="loginForm" on:submit|preventDefault={submitLogin}>
					<div class:hide-it={!errorVisible} class="error alert alert-danger">로그인 실패</div>
					<div class="form-group">
						<label for="id">ID</label>
						<input
							type="text"
							class="form-control"
							name="id"
							id="id"
							aria-describedby="emailHelp"
							bind:value={id}
						/>
						<small id="emailHelp" class="form-text text-muted">아이디를 입력해주세요.</small>
					</div>
					<div class="form-group">
						<label for="pass">Password</label>
						<input
							type="password"
							class="form-control"
							name="pass"
							id="pass"
							bind:value={pass}
							bind:this={passInput}
							on:keyup={(event) => event.key !== 'Enter' && resetError()}
						/>
					</div>
					<button type="submit" class="btn btn-primary" disabled={loading}>
						{loading ? '로그인 중...' : 'LOGIN'}
					</button>
				</form>
			{/if}

			<div id="link-area">
				{#each projects as project (project.projectCode)}
					<a href={`/${project.projectCode}`} class="btn btn-primary btn-lg form-control mb-3">
						{project.projectName}
					</a>
				{/each}
			</div>
		</div>
		<div class="col-3"></div>
	</div>
</div>
