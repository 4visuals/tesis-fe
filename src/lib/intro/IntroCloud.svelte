<script lang="ts">
	export let apiBase = '';
	export let recentHtml = '';
</script>

<div class="jumbotron text-center">
	<h4>회원끼리 자료공유</h4>
	<h1>곳간</h1>
</div>
<div class="recent-materials">{@html recentHtml}</div>
<div>
	<p>[곳간]은 서경인 연구작업에 참여했던 연구회원들이 자료를 공유하는 곳입니다.</p>
</div>

<div id="accordion">
	<div class="card">
		<div class="card-header">
			<a class="card-link" data-toggle="collapse" href="#collapseLink"> [사이트 바로가기] </a>
		</div>
		<div id="collapseLink" class="collapse" data-parent="#accordion">
			<div class="card-body">
				서경인 회원들이 자주 이용하는 사이트 바로가기
				<br />
				<div>
					<a class="btn btn-warning mt-2 mr-2 mb-2" href="https://두루책방.com" target="_blank" rel="noreferrer">
						두루책방
					</a>
					<a class="btn btn-primary mt-2 mr-2 mb-2" href="https://twinkl.co.uk" target="_blank" rel="noreferrer">
						Twinkl
					</a>
					<a class="btn btn-info mt-2 mr-2 mb-2" href="http://greamhangeul.com" target="_blank" rel="noreferrer">
						그림한글
					</a>
				</div>
				즐겨찾기
				<br />
				<div>
					<a class="btn btn-primary mt-2 mr-2" href="https://blog.naver.com/ewhasped12" target="_blank" rel="noreferrer">
						주간특수학급
					</a>
					<a class="btn btn-primary mt-2 mr-2" href="https://chamssaem.tistory.com" target="_blank" rel="noreferrer">
						참쌤스쿨
					</a>
					<a class="btn btn-primary mt-2 mr-2" href="https://youtube.com/c/투수다2SUDA" target="_blank" rel="noreferrer">
						투수다
					</a>
					<a class="btn btn-info mt-2 mr-2" href="https://mom.mirae-n.com" target="_blank" rel="noreferrer">
						맘티처
					</a>
					<a class="btn btn-info mt-2 mr-2" href="https://funmom.tistory.com" target="_blank" rel="noreferrer">
						펀맘
					</a>
				</div>
			</div>
		</div>
	</div>

	<div class="card">
		<div class="card-header">
			<a class="card-link" data-toggle="collapse" href="#collapseOne"> [곳간]에는 </a>
		</div>
		<div id="collapseOne" class="collapse" data-parent="#accordion">
			<div class="card-body">회원이 직접 만든 자료를 중심으로 올려주세요, 또는 정말로 추천하고 싶은 자료를 출처를 밝히고 올려주세요.</div>
		</div>
	</div>

	<div class="card">
		<div class="card-header">
			<a class="collapsed card-link" data-toggle="collapse" href="#collapseTwo"> [곳간]에 자료를 올릴 때는 </a>
		</div>
		<div id="collapseTwo" class="collapse" data-parent="#accordion">
			<div class="card-body">
				수정하여 사용해도 좋은 자료는 원래의 자료 형태와 pdf파일로, 수정 사용을 원치 않으면 pdf 파일만 올려주세요.
				<br />
				번거롭더라도 jpg, 또는 png 파일로 변환하여 함께 올려 주세요. 다운로드 받지 않더라도 어떤 내용인지 미리 볼 수 있어 바쁜
				선생님들의 수고를 덜어줄 수 있습니다.
			</div>
		</div>
	</div>

	<div class="card">
		<div class="card-header">
			<a class="collapsed card-link" data-toggle="collapse" href="#collapseThree"> [곳간]을 이용할 떄는 </a>
		</div>
		<div id="collapseThree" class="collapse" data-parent="#accordion">
			<div class="card-body">
				다른 선생님의 자료가 내 수업에 크게 도움이 되었을 때는 자료를 올려주신 선생님께 감사의 마음을 메시지로 표현할 수 있습니다.
				수정 의견도 큰 도움이 되겠지요.
				<br />
				좋은 자료로 곳간이 넘쳐 나기를...
			</div>
		</div>
	</div>

	<div class="card">
		<div class="card-header">
			<a class="collapsed card-link" data-toggle="collapse" href="#collapseFour"> 자료 업로드 방법 </a>
		</div>
		<div id="collapseFour" class="collapse" data-parent="#accordion">
			<div class="card-body">
				<iframe
					class="mb-5"
					height="100%"
					src="https://youtube.com/embed/cjeClPEknd0?controls=0"
					frameborder="1"
					allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
				></iframe>
			</div>
		</div>
	</div>

	<div class="card">
		<div class="card-header">
			<a class="collapsed card-link" data-toggle="collapse" href="#collapseFour"> 자료 업로드 관련 Q&A </a>
		</div>
		<div id="collapseFour" class="collapse" data-parent="#accordion">
			<div class="card-body">
				* Q1:
				<br />
				A1:
				<br />
				* Q2:
				<br />
				A2:
				<br />
				* Q3:
				<br />
				A3:
				<br />
			</div>
		</div>
	</div>
</div>
