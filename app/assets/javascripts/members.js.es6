((w) => {
  w.gl = w.gl || {};

  class Members {
    constructor() {
      this.removeListeners();
      this.addListeners();
      this.createDropdown();
    }

    removeListeners() {
      $('.project_member, .group_member').off('ajax:success');
      $('.js-member-update-control').off('change');
      $('.js-edit-member-form').off('ajax:success');
    }

    addListeners() {
      $('.project_member, .group_member').on('ajax:success', this.removeRow);
      $('.js-member-update-control').on('change', this.formSubmit);
      $('.js-edit-member-form').on('ajax:success', this.formSuccess);
    }

    removeRow(e) {
      const $target = $(e.target);

      if ($target.hasClass('btn-remove')) {
        $target.closest('.member')
          .fadeOut(function () {
            $(this).remove();
          });
      }
    }

    formSubmit() {
      $(this).closest('form')
        .trigger("submit.rails")
        .end()
        .disable();
    }

    formSuccess() {
      $(this).find('.js-member-update-control').enable();
    }

    createDropdown() {
      const $userInput = $('#js-member-user-ids'),
            $groupInput = $('#js-member-group-ids'),
            self = this;
      let selected = [],
          user_ids = [],
          group_ids = [];

      const updateIdInputs = () => {
        $userInput.val(user_ids.join(','));
        $groupInput.val(group_ids.join(','));
      };

      $('.js-member-dropdown').each(function () {
        const $this = $(this);

        $this.glDropdown({
          data(term, callback) {
            term = term.split(',');
            term = term[term.length - 1];
            term = term.replace(selected.join(','), '');

            if (term.match(/^[^@]+@[^@]+$/)) {
              callback([{ inviteEmail: term }]);
            } else {
              self.getData($this.attr('data-url'), term, callback);
            }
          },
          filterable: true,
          filterRemote: true,
          filterInput: '.js-member-dropdown',
          selectable: true,
          multiSelect: true,
          fieldName: 'user_ids[]',
          id(item, $el) {
            const val = item.inviteEmail || item.name,
                  id  = item.inviteEmail || item.id;

            if ($el.hasClass('is-active')) {
              const itemIndex = selected.indexOf(val);
              selected.splice(itemIndex, 1);

              if ($el.attr('data-group') === 'Groups' && !item.inviteEmail) {
                const groupIdIndex = group_ids.indexOf(item.id);
                group_ids.splice(groupIdIndex, 1);
              } else {
                const userIdIndex = user_ids.indexOf(id);
                user_ids.splice(userIdIndex, 1);
              }
            } else {
              selected.push(val);

              if ($el.attr('data-group') === 'Groups' && !item.inviteEmail) {
                group_ids.push(item.id);
              } else {
                user_ids.push(id);
              }
            }

            updateIdInputs();

            return selected;
          },
          renderRow(item, group, index) {
            const listItem = document.createElement('li'),
                  link = document.createElement('a');

            link.href = '#';

            if (item.inviteEmail) {
              link.innerHTML = `<strong>Invite:</strong> ${item.inviteEmail}`;
            } else {
              const avatar = document.createElement('img'),
                    name = document.createElement('span')

              listItem.className = 'clearfix';
              avatar.className = 'avatar s36';
              avatar.src = item.avatar_url || gon.default_avatar_url;

              name.innerHTML = item.name;

              if (item.username) {
                name.innerHTML += `<br/>@${item.username}`;
              }

              if (group) {
                link.dataset.group = group;
                link.dataset.index = index;
              }

              if (selected.indexOf(item.id) > -1) {
                link.className = 'is-active';
              }

              link.appendChild(avatar);
              link.appendChild(name);
            }

            listItem.appendChild(link);

            return listItem;
          }
        }).on('input', function () {
          const $this = $(this),
                val = $this.val().split(','),
                data = $this.data('glDropdown').fullData;

          if (data) {
            // Reset the selected data
            user_ids = [];
            group_ids = [];
            selected = [];

            // Loop through the rendered data
            // This gets rid of any objects that have been removed when the user deletes in the field
            for (const group in data) {
              const groupData = data[group];

              for (let i = 0, groupDataLength = groupData.length; i < groupDataLength; i++) {
                const item = groupData[i];

                if (val.indexOf(item.name) > -1) {
                  selected.push(item.name);

                  if (group === 'Groups') {
                    group_ids.push(item.id);
                  } else {
                    user_ids.push(item.id);
                  }
                }
              }
            }

            updateIdInputs();
          }
        });
      });
    }

    getData(endpoint, term, callback) {
      $.ajax({
        url: endpoint,
        data: {
          search: term
        }
      }).then(callback);
    }
  }

  gl.Members = Members;
})(window);
