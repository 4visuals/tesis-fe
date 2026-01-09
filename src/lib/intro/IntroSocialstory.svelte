<script lang="ts">
	export let apiBase = '';
	export let recentHtml = '';
</script>

<div class="jumbotron text-center">
	<h4>2020 서경인 프로젝트</h4>
	<h1>그림으로 배우는 학교</h1>
</div>
<div class="recent-materials">{@html recentHtml}</div>
<div>
	<p>
		자폐성장애학생들에게 학교는 물리적, 사회적으로 구조화되지 못하였을 뿐 아니라 다양한 유형의 의사소통 대상이 존재하는 매우 복잡한
		공간입니다. 그렇기 때문에 학교에서의 일과나 규칙, 적절한 의사소통 방법을 배울 때, 또 예측하지 못한 변화와 마주쳤을 때 많은
		학생들은 어려움을 겪습니다. 자폐성장애학생의 감각 특성이나 학습 양식을 잘 알고 있는 특수교사에게도 생활지도와 다양한 문제행동
		관리는 참으로 어려운 영역입니다.
		<br />
		<br />
		교육자료 면에서도 생활지도 자료는 학습지도 자료에 비해 턱 없이 부족하며, 자폐성장애학생의 특성이 반영된 자료는 특히 쉽게 찾기
		어렵습니다. 또 학생 개개인마다 각각 다른 감각적 특성과 문제행동을 보이기 때문에 마음에 드는 자료를 찾기는 더욱 어렵습니다. 최근
		인터넷을 통해 외국에서 제작된 다양한 형태의 자료를 접해보기는 수월해졌지만 언어적, 문화적 차이로 인해 그대로 적용할 수 있는
		자료 역시 많지 않습니다.
		<br />
		<br />
		이런 여러 가지 이유로 우리나라의 특수교육 현장에 있는 교사들은 적절한 자료를 찾거나 만들기 위해 각자 많은 시간을 할애하고
		있습니다. 효과적인 생활지도와 문제행동 관리를 위해서는 계획적이고 일관적이고 협력적인 지원이 필요하지만, 필요할 때 혹은 문제가
		발생했을 때 임기응변식으로 문제를 해결하게 되는 경우도 많습니다.
		<br />
		<br />
		서울경인지역특수학급교사연구회는 2019년 '자폐학생 깊이 알기' 프로젝트에 이어 2020년 자폐성장애학생을 위한 학교생활기술 지도
		프로젝트 [그림으로 배우는 학교]를 함께 하고자 합니다.
	</p>
</div>

<div id="accordion">
	<div class="card">
		<div class="card-header">
			<a class="card-link" data-toggle="collapse" href="#collapseOne">
				[그림으로 배우는 학교]는 자폐성장애학생들의 학교생활적응을 돕기 위해 만든 자료입니다.
			</a>
		</div>
		<div id="collapseOne" class="collapse" data-parent="#accordion">
			<div class="card-body">
				학교에서의 일과와 그 일과를 통해 해야 할 일, 규칙, 상황에 맞는 적절한 의사소통 방법을 익힐 수 있도록 구성하였습니다.
				<br />
				학생들이 학교에서 보이는 문제행동의 대부분은 일과에 대한 이해가 부족하거나 적절한 의사소통 방법을 모르거나 적절한 대처 기술이
				부족하기 때문입니다.
				<br />
				학교생활에서 기본적으로 요구되는 적응행동 기술을 배우는 것은 독립적인 생활능력을 향상시키고 문제행동을 예방할 수 있는 가장
				긍정적인 방법입니다.
			</div>
		</div>
	</div>

	<div class="card">
		<div class="card-header">
			<a class="collapsed card-link" data-toggle="collapse" href="#collapseTwo">
				[그림으로 배우는 학교]는 자폐성장애학생을 위한 시각적 지원에 초점을 두고 있습니다.
			</a>
		</div>
		<div id="collapseTwo" class="collapse" data-parent="#accordion">
			<div class="card-body">
				학교에서 일어나는 수업이나 상호작용의 대부분은 구어적인 형태로 이루어지는 경우가 많아 자폐성장애학생들은 새로운 것을 배우고
				이해하는데 어려움을 겪습니다.
				<br />
				자폐성장애학생의 감각적 특성을 고려하고, 증거기반의 실제로 입증된 형태인 상황이야기, 순서 카드, 그림 자료, 의사소통 카드,
				<br />
				학습지, 놀이 자료, 기타 자료들을 제작하였고 비디오모델링 자료도 한 곳에 모았습니다.
			</div>
		</div>
	</div>

	<div class="card">
		<div class="card-header">
			<a class="collapsed card-link" data-toggle="collapse" href="#collapseThree">
				[그림으로 배우는 학교]는 인터넷을 기반으로 하여 접근성을 높였습니다.
			</a>
		</div>
		<div id="collapseThree" class="collapse" data-parent="#accordion">
			<div class="card-body">
				인터넷을 통해 자료를 쉽게 찾아보고 공유할 수 있으며 동영상 자료에도 간편하게 접근할 수 있습니다.
				<br />
				스마트폰이나 태블릿을 활용하여 생활지도나 문제행동 지도 상황에서 학생에게 즉각적으로 자료를 제시할 수도 있습니다.
			</div>
		</div>
	</div>

	<div class="card">
		<div class="card-header">
			<a class="collapsed card-link" data-toggle="collapse" href="#collapseFour">
				[그림으로 배우는 학교]는 보편적인 자료이며 예시 자료입니다.
			</a>
		</div>
		<div id="collapseFour" class="collapse" data-parent="#accordion">
			<div class="card-body">
				모든 파일은 다운로드하여 편집 가능하게 제공됩니다.
				<br />
				각 학생의 개별적인 요구와 의사소통 특성, 문제행동 등을 고려하여 상황에 맞게 수정하거나 창의적으로 재구성하여 사용할 수
				있습니다.
			</div>
		</div>
	</div>

	<div class="card">
		<div class="card-header">
			<a class="collapsed card-link" data-toggle="collapse" href="#collapseFive" style="text-align: center">
				<a class="btn btn-warning collapsed card-link" data-toggle="collapse" href="#collapseFive">
					학교생활기술 목록 보기
				</a>
				<a class="btn btn-danger ml-2" href={`${apiBase}/resources/files/lists.hwp`}>
					목록 다운로드
				</a>
			</a>
		</div>
		<div id="collapseFive" class="collapse" data-parent="#accordion">
			<div class="card-body">
				<img class="col" src={`${apiBase}/resources/images/list01.png`} />
				<img class="col" src={`${apiBase}/resources/images/list02.png`} />
				<img class="col" src={`${apiBase}/resources/images/list03.png`} />
				<img class="col" src={`${apiBase}/resources/images/list04.png`} />
				<img class="col" src={`${apiBase}/resources/images/list05.png`} />
				<img class="col" src={`${apiBase}/resources/images/list06.png`} />
				<img class="col" src={`${apiBase}/resources/images/list07.png`} />
				<img class="col" src={`${apiBase}/resources/images/list08.png`} />
				<img class="col" src={`${apiBase}/resources/images/list09.png`} />
				<img class="col" src={`${apiBase}/resources/images/list10.png`} />
			</div>
		</div>
	</div>
</div>
