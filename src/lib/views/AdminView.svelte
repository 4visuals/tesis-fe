<svelte:head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
  <script>
    var ctxpath = ''
  </script>
  <script
    src="https://code.jquery.com/jquery-3.4.1.js"
    integrity="sha256-WpOohJOqMqqyKL9FccASB9O0KwACQJpFTUBLTYOVvVU="
    crossorigin="anonymous"
  ></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"></script>
  <script type="text/javascript" src="/js/bootstrap.js"></script>
  <script src="https://kit.fontawesome.com/ee2ae3520a.js"></script>
  <link href="/css/bootstrap.css" rel="stylesheet" />
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
  <link href="/css/common.css" rel="stylesheet" />
  <title>TESIS 관리자</title>
</svelte:head>

<script lang="ts">
  import { page } from '$app/stores'

  $: path = $page.url.pathname
  $: lastSegment = path.split('/').filter(Boolean).pop() ?? ''
  const isActive = (id: string): boolean => id === lastSegment
</script>

<header style="height: 50px">
  <nav class="navbar navbar-expand-sm navbar-light bg-light fixed-top">
    <a class="navbar-brand" href="/nimda">TESIS</a>
    <button
      class="navbar-toggler"
      type="button"
      data-toggle="collapse"
      data-target="#navbar-body"
      aria-controls="navbar-body"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbar-body">
      <ul class="navbar-nav mr-auto">
        <li class="nav-item" id="projects">
          <a class="nav-link" class:active={isActive('projects')} href="/nimda/projects">프로젝트</a>
        </li>
        <li class="nav-item" id="teams">
          <a class="nav-link" class:active={isActive('teams')} href="/nimda/teams">팀</a>
        </li>
        <li class="nav-item" id="userlist">
          <a class="nav-link" class:active={isActive('userlist')} href="/nimda/userlist">회원</a>
        </li>
      </ul>
      <a>LOGOUT</a>
    </div>
  </nav>
</header>
<div class="container-fluid">
  <div class="row">
    <div class="col-12"></div>
  </div>
</div>

<style lang="scss">
  .navbar {
    box-shadow: 0px 1px 3px 1px #ccc;
  }
</style>
