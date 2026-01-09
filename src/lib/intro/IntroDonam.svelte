<script lang="ts">
	export let apiBase = '';
	export let recentHtml = '';
</script>

<div class="jumbotron text-center">
	<h4>개별2반</h4>
	<h1>서울돈암초등학교</h1>
</div>
<div class="recent-materials">{@html recentHtml}</div>
<div>
	<p>[돈암초 개별2반]은 서울돈암초등학교 개별2반의 자료 모음터</p>
</div>

<div id="accordion">
	<div class="card">
		<div class="card-header">
			<a class="card-link" data-toggle="collapse" href="#collapseLink"> [사이트 바로가기] </a>
		</div>
		<div id="collapseLink" class="collapse" data-parent="#accordion">
			<div class="card-body">1.</div>
		</div>
	</div>
</div>
