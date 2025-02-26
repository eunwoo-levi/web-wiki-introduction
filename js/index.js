document.addEventListener('DOMContentLoaded', () => {
  // 화면 전환 애니메이션 설정
  const sections = document.querySelectorAll('section');

  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
    }
  );

  sections.forEach((section) => {
    observer.observe(section);
  });

  // API 키 및 BIN ID 설정
  const apiKey = '$2a$10$gtjUhLPHavkPKnh22oy31ejmOx7GGJkQLF9rl3DUQmDTFCKh7ij4K';
  const binId = '67bed317e41b4d34e49cbae9';

  // HTML 요소 참조
  const commentList = document.getElementById('comment-list');
  const commentForm = document.getElementById('comment-form');
  const commentInput = document.getElementById('comment-input');

  // HTML 요소가 정상적으로 로드되었는지 확인
  if (!commentList || !commentForm || !commentInput) {
    console.error('HTML 요소를 찾을 수 없습니다. ID를 확인하세요.');
    return;
  }

  // 댓글 데이터를 저장할 배열 초기화
  let comments = [];

  // 댓글 불러오기
  async function loadComments() {
    try {
      const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
        headers: {
          'X-Master-Key': apiKey,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('불러온 데이터:', data);

        if (Array.isArray(data.record.comments)) {
          comments = data.record.comments;
        } else {
          console.warn('comments가 배열 형태가 아닙니다. 초기화합니다.');
          comments = [];
        }

        commentList.textContent = '';
        comments.forEach((comment) => {
          const commentItem = document.createElement('li');
          commentItem.className = 'comment-item'; // 댓글 스타일 클래스 추가
          commentItem.textContent = comment;
          commentList.appendChild(commentItem);
        });
      } else {
        alert('댓글 불러오기 실패: ' + response.statusText);
        console.error('API 응답 오류:', response);
      }
    } catch (error) {
      alert('API 호출 에러');
      console.error('API 호출 에러:', error);
    }
  }

  // 댓글을 JsonBin에 저장
  async function saveComment(commentText) {
    try {
      // 기존 댓글을 먼저 불러온 후 새로운 댓글 추가
      await loadComments();
      comments.push(commentText);

      const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': apiKey,
        },
        body: JSON.stringify({ comments }),
      });

      if (response.ok) {
        await loadComments(); // 댓글 저장 후 다시 불러오기
        alert('댓글이 등록되었습니다!');
      } else {
        alert('댓글 저장 실패: ' + response.statusText);
        console.error('저장 실패 응답:', response);
      }
    } catch (error) {
      alert('댓글 저장 중 오류가 발생했습니다.');
      console.error('댓글 저장 에러:', error);
    }
  }

  // 폼 제출 시 댓글 저장
  commentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const commentText = commentInput.value.trim();

    if (commentText) {
      saveComment(commentText);
      commentInput.value = '';
    } else {
      alert('댓글을 입력해주세요!');
    }
  });

  // 페이지 로딩 시 댓글 불러오기
  loadComments();
});
