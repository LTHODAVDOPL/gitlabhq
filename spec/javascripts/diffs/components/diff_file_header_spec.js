Vue.use(Vuex);

      diffs: diffsModule(),
      notes: notesModule(),
        props.discussionPath = 'link://to/discussion';
      it('returns the discussionPath for files', () => {
        expect(vm.titleLink).toBe(props.discussionPath);

      it('sets the correct path to the discussion', () => {
        props.discussionPath = 'link://to/discussion';
        vm = mountComponentWithStore(Component, { props, store });
        const href = vm.$el.querySelector('.js-title-wrapper').getAttribute('href');

        expect(href).toBe(vm.discussionPath);
      });


      expect(button.dataset.clipboardText).toBe(
        '{"text":"files/ruby/popen.rb","gfm":"`files/ruby/popen.rb`"}',
      );


          const notesModuleMock = notesModule();
          notesModuleMock.getters.discussions = discussionGetter;
                diffs: diffsModule(),
                notes: notesModuleMock,