<script lang="ts">
	export let apiBase = '';
	export let recentHtml = '';
</script>

<div class="jumbotron text-center">
	<h4>특수교사를 위한</h4>
	<h1>교수학습 지원자료</h1>
</div>
<div class="recent-materials">{@html recentHtml}</div>
<div>
	<p>특수교사에게 꼭 필요한 자료를 어디에서나 손쉽게 볼 수 있도록 한 곳에 모읍니다.</p>
</div>
<div id="accordion">
	<div class="card">
		<div class="card-header">
			<a class="card-link" data-toggle="collapse" href="#collapseOne">
				[특수교육 교과서]
			</a>
		</div>
		<div id="collapseOne" class="collapse" data-parent="#accordion">
			<div class="card-body">
				특수교육 교과서 중 국어와 수학 교과서를 지원자료에 게시합니다. 필요한 교과서는 구매하여 사용해 주세요.
				<br />
				특수교육 교과서는 에듀넷 디지털교과서 홈페이지에서 볼 수 있습니다.
				<br />
				<a class="btn btn-warning mt-2" href="https://webdt.edunet.net" target="_blank" rel="noreferrer">
					디지털교과서 바로가기
				</a>
			</div>
		</div>
	</div>

	<div class="card">
		<div class="card-header">
			<a class="collapsed card-link" data-toggle="collapse" href="#collapseTwo">
				[통합교육지원자료]
			</a>
		</div>
		<div id="collapseTwo" class="collapse" data-parent="#accordion">
			<div class="card-body">
				국립특수교육원에서는 초등학교 교과서를 기본으로 하여 통합교육지원자료를 발간합니다. 통합교육지원자료는 발달장애학생이 일반
				교육과정의 내용을 쉽게 이해하고 같은 공간에서 같은 내용으로 공부할 수 있도록 구성되었습니다.
				<br />
				특수교사가 통합교육지원자료의 내용을 파악하기 위한 목적으로 지원자료에 게시합니다. 필요한 통합교육지원자료는 구매하여 사용해
				주세요.
			</div>
		</div>
	</div>

	<div class="card">
		<div class="card-header">
			<a class="collapsed card-link" data-toggle="collapse" href="#collapseThree">
				[장애이해교육]
			</a>
		</div>
		<div id="collapseThree" class="collapse" data-parent="#accordion">
			<div class="card-body">
				장애이해교육과 관련된 주요 자료 및 서경인 선생님들이 제작한 자료를 한 곳에 모았습니다.
			</div>
		</div>
	</div>

	<div class="card">
		<div class="card-header">
			<a class="collapsed card-link" data-toggle="collapse" href="#collapseFour">
				[한글자료]
			</a>
		</div>
		<div id="collapseFour" class="collapse" data-parent="#accordion">
			<div class="card-body">
				자모음 조합 원리에 따라 제작된 EBS의 [한글이 야호2] 동영상과 함께 학습할 수 있는 한글 학습지를 동영상과 함께
				게시합니다.
				<br />
				[개학을 꿈꾸는 프로젝트]
				<br />
				서경인의 2020년 그림으로 배우는 학교 프로젝트 3월팀이 개학을 기다리며 함께 만든 자료입니다.
				<br />
				강현수 선생님, 홍정아 선생님, 오선영 선생님, 신소니아 선생님, 권다미 선생님, 조재영 선생님이 함께 만들었습니다.
			</div>
		</div>
	</div>

	<div class="card">
		<div class="card-header">
			<a class="collapsed card-link" data-toggle="collapse" href="#collapseFive">
				[의사소통판]
			</a>
		</div>
		<div id="collapseFive" class="collapse" data-parent="#accordion">
			<div class="card-body">학교 상황에서 필요한 의사소통판을 제공합니다.</div>
		</div>
	</div>

	<div class="card">
		<div class="card-header">
			<a class="collapsed card-link" data-toggle="collapse" href="#collapseSix">
				지원자료는 계속 추가됩니다.
			</a>
		</div>
		<div id="collapseSix" class="collapse" data-parent="#accordion">
			<div class="card-body">
				모든 특수교사에게 꼭 필요한 자료, 그래서 이 곳에 있으면 좋겠다 생각되는 자료가 있으면 서경인 까페 또는 오픈카톡방에
				자유롭게 추천해 주세요.
			</div>
		</div>
	</div>
</div>
