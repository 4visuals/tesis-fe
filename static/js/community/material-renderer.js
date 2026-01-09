(function(){
	/**
	 * 
	 */
	function render(materials, bookmarks, option) {	
		var cardTpl = 
			`<div class="col-12 col-section">
				<div class="card mb-4 box-shadow" data-mseq="{mseq}">
			  		<div>{carousel}</div>
				  	<div class="card-block px-6"> 
					  	<h5 class="card-title">{title}</h5>
					  	<div class="fileGroup">   	
					    	{{btns}}
						</div>
						<div class="owner-info">
							<span class="owner @hide badge badge-info">{owner} 선생님</span>
			                <span class="cate badge badge-dark" title="{cate-path}">{cate}</span>
							<a href="#" class="comment"><span class=" material-icons">comment</span><span class="mention-cnt">{{mcnt}}</span></a>
						</div>
					</div>
				</div>		
			 </div>`
		
		function isAdmin(material) {
			return material.owner.userName === '서경인'
		}	
			
		function replace(s, param) {
			var dest = s
			for(var k in param) {
				var v = param[k]
				var pattern = '{' + k + '}'
				var idx = -1;
				while((idx = dest.indexOf(pattern)) >= 0) {

					dest = dest.replace(pattern, k === 'title' ? v : ctxpath + v)
				}
			}
			return dest
		}

		var carousel = {
			header: `<li data-target="#{carousel-id}" data-slide-to="{idx}" class="{active}"></li>`,
			body : `<div class="carousel-item {active}">
			      <img src="{link}" class="d-block w-100">
			    </div>`
		}
		var carouselWrapper =
		`<div id="{carousel-id}" class="carousel slide" data-ride="carousel">
			<div class="floating-r-button">
				<a href="#" class="{state} bookmark"><span class="material-icons">star</span></a>
				<a href="#" class="material-icons view-img">open_in_new</a>
			</div>
			
			<a href="#" class="view-all material-icons">apps</a>
			  <ol class="carousel-indicators">
			    {headers}
			  </ol>
			  <div class="carousel-inner">
			    {bodies}
			  </div>
			  <a class="control carousel-control-prev" href="#{carousel-id}" role="button" data-slide="prev">
			    <span class="" aria-hidden="true"></span>
			    <span class="sr-only">Previous</span>
			  </a>
			  <a class="control carousel-control-next" href="#{carousel-id}" role="button" data-slide="next">
			    <span class="" aria-hidden="true"></span>
			    <span class="sr-only">Next</span>
			  </a>
			</div>`

		function makeCarousel(html, material) {
			// 이미지 파일과 PDF 썸네일 구분
			    const imageFiles = material.thumnails.filter(thum => 
			        thum.originFileName.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/));
			    const pdfThumbnails = material.thumnails.filter(thum => 
			        !thum.originFileName.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/));
			
//			const images = material.thumnails
			// 이미지 파일 먼저, 그 다음 PDF 썸네일 순서로 정렬
		    const sortedImages = [...imageFiles, ...pdfThumbnails];
			
			var headHtml = ''
			var bodyHtml = ''
			var index = 0
			var carouselID = "crs" + parseInt(Math.random()*100000000000)

			sortedImages.forEach(thum => {
				// replace(carousel.header, {'idx': index, 'active': (index === 0)?'active' :''})
				headHtml += carousel.header
					.replace('{carousel-id}', carouselID)
					.replace('{idx}', index)
					.replace('{active}',(index === 0? 'active' :''))

				///bodyHtml += replace(carousel.body, {'link': ctxpath + url, 'active': (index === 0)?'active' :''})
				bodyHtml += carousel.body
					.replace('{link}', `https://kr.object.ncloudstorage.com/tesis/${thum.generatedPath}`)
					.replace('{active}', (index === 0?'active' :''))
				index ++
			})
			const bookmarked =  bookmarks ? bookmarks.find(bmk => bmk.materialSeq === material.seq) : null
			var carouselHtml =  carouselWrapper
				.replace('{carousel-id}', carouselID)
				.replace('{carousel-id}', carouselID)
				.replace('{carousel-id}', carouselID)
				.replace('{headers}', headHtml)
				.replace('{bodies}', bodyHtml)
				.replace('{state}', bookmarked ? 'active' : 'normal')
			return html.replace('{carousel}', carouselHtml)
		}
		function img(html, images) {
			var t = '<img src="{link}" height="360">';
			var imgTag = ''
			images.forEach(url => {
				imgTag += t.replace('{link}', ctxpath + url)
			})
			return html.replace('{img}', imgTag)
		}
		/**
		 * ext := '{hwp}'
		 */
		function emptyFileButton() {
			return `<a class="btn btn-light mr-2 hide-it" href="#" >파일없음</a>`
		}
		function processFileButton(contents) {
			var colors = {
				pdf: 'btn-danger',
				hwp: 'btn-primary',
				ppt: 'btn-success',
				pptx: 'btn-success',
				etc: 'btn-warning'
			}
			var tpl = `<a target="_blank" class="btn @color mr-2 " title="@fname" href="@link" >@txt</a>`
			var html = ''
			function ext2color(exp) {
				var c = colors[exp]
				return c ? c : colors.etc
			}
			
			function ext(s) {
				var i = s.lastIndexOf('.')
				return s.substring(i+1)
			}
			contents.forEach(file => {
				var extPart = ext(file.originFileName)
				html += tpl.replace('@link', `https://kr.object.ncloudstorage.com/tesis/${file.generatedPath}`)
				   .replace('@txt', extPart)
				   .replace('@fname', file.originFileName)
				   .replace('@color', ext2color(extPart))
			})
			return html
		}
		var youtube = {
			videoTpl: 
					`<div class="col-12 col-section">
						<div class="card mb-4 box-shadow" data-mseq="{mseq}">
							<div class="floating-r-button">
								<a href="#" class="{state} bookmark"><span class="material-icons">star</span></a>
							</div>
					  		<div>{video}</div>
						  	<div class="card-block px-6"> 
							  	<h5 class="card-title">{title}</h5>
							  	<div class="owner-info">
									<span class="owner @hide badge badge-info">{owner} 선생님</span>
									<span class="cate badge badge-dark">{cate}</span>
									<a href="#" class="comment"><span class=" material-icons">comment</span><span class="mention-cnt">{{mcnt}}</span></a>
								</div>
							</div>
						</div>		
					 </div>` , 
			embbedTpl : `<iframe class="video-material" width="100%" src="https://www.youtube.com/embed/@url?rel=0?controls=1" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`,
			parseUrl(url) {
				var idx = url.lastIndexOf('/')
				return url.substring(idx+1)
			}
		}

		function renderSocialStories(materials) {
			// var $body = $('#story-body')
			var $body = ''
			var deleteButton ;
			materials.forEach(m => {
				console.log(m)
//				console.log(m.category.fullPath)
				const bookmarked = bookmarks ? bookmarks.find(bmk => bmk.materialSeq === m.seq)  : null
				var html = ''
				if(m.thumnails.length === 0 && m.contents.length === 1 && m.contents[0].type === 'VIDEO') {
					html = youtube.videoTpl
								.replace('{title}', m.title)
								.replace('{owner}', m.owner.userName)
								.replace('{cate}', m.category.categoryName)
								.replace('{cate-path}', m.category.fullPath) // 풀 경로 추가
//								.replace('@hide', isAdmin(m) ? 'hide-it' : '')
								.replace('{mseq}', m.seq)
								.replace('{video}', youtube.embbedTpl)
								.replace('{{mcnt}}', m.mentionCnt > 0 ? m.mentionCnt : '')
								.replace('@url', youtube.parseUrl(m.contents[0].generatedPath))
								.replace('{state}', bookmarked ? 'active': 'normal')
				} else {
					html = replace(cardTpl, {
//						title: story.title.replace(subtitle+'_', '')
						title: m.title,
						cardtype: 'card'
					})
					html = html.replace('{owner}', m.owner.userName)
						        .replace('{cate}', m.category.categoryName)
								.replace('{cate-path}', m.category.fullPath) 
//								.replace('@hide', isAdmin(m) ? 'hide-it' : '')
								.replace('{mseq}', m.seq)
								.replace('{{mcnt}}', m.mentionCnt > 0 ? m.mentionCnt : '')

					// hwp, pdf, ppt 처리
					html = makeCarousel(html, m)
					var btnHtml = m.contents.length === 0 ? emptyFileButton() : processFileButton(m.contents)
					html = html.replace('{{btns}}', btnHtml)
					deleteButton = false;
				}
				$body += html
				
			})
			
			return $body
		}

		var tabContents = ''
		var subtitle = ''
		
		option = option || {renderTitle: true}

		if (option.renderTitle) {
			var m = materials[0]
			if (m ) {
				subtitle = m.category.categoryName
			}
		} else {
			subtitle = ''
		}
		var carousel = renderSocialStories(materials)
		var t = `<div class="tab-pane fade active show"><div class="album bg-light"><h4 class="carousel-title">{subtitle}</h4><div><div class="row">${carousel}</div></div></div></div>`
		tabContents += t.replace('{subtitle}', subtitle);
		
		return tabContents			
	}
	
	var tesis = window.tesis
	tesis.material = tesis.material || {}
	tesis.material.render = render
	
})()