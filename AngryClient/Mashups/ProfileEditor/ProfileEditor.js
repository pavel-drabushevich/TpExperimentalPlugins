tau.mashups
.addDependency("tp/bus")
.addDependency("tp/plugins/profileControlsBlock")
.addDependency("tp/plugins/profileRepository")
.addDependency("libs/jquery/jquery")
.addMashup(function (bus, profileControlsBlock, profileRepository, jquery, config) {
	function taskCreatorProfileEditor(config) {
		this._create(config);
	}

	taskCreatorProfileEditor.prototype = {
		template: null,
		placeHolder: null,
		saveBtn: null,
		_projects: null,
		_returnUrl: null,
		showSampleLink: null,
		samplePopup: null,

		_create: function (config) {
			this.placeHolder = config.placeHolder;
			this.repository = profileRepository;
			this._returnUrl = new Tp.WebServiceURL("/Admin/Plugins.aspx").toString();

			this.template = '<div>' +
                    '<form method="POST">' +
                    '<h2 class="h2">Plugin</h2>' +
                    '<p class="note">This plugin do something.</p>' +
                    '<div class="task-creator-settings">' +
                    '	<div class="pad-box">' +
                    '		<p class="label">Profile Name&nbsp;<span class="error" name="NameErrorLabel"></span><br />' +
					'		<span class="small">Once this name is saved, you can not change it.</span></p>' +
                    '		<input id="profileNameTextBox" type="text" name="Name" class="input" style="width: 275px;" value="${Name}" />' +
                    '	</div>' +
                    '	<div class="separator"></div>' +
                    '	<div class="pad-box">' +
                    '		<h3 class="h3">Plugin Settings</h3>' +
                    '		<p class="label pt-5">Select Project&nbsp;<span class="error" name="ProjectErrorLabel"></span><br /><span class="small">The plugin do something from this project.</span></p>' +
                    '		<select class="select" id="projectsDropDown" name="Project">' +
                    '           <option value="0">- Select project -</option>' +
                    '			{{each projects}}<option value="${Id}">${Name}</option>{{/each}}' +
                    '		</select>' +
					'	</div>' +
					'	<div class="controls-block">' +
                    '</div>' +
                    '</form>' +
                    '</div>';

			this.bus = bus;
			this.bus.subscribe('TaskCreatorProfileEditor', {
				onSaveProfile: $.proxy(this._saveProfile, this),
				onProfileSaveSucceed: $.proxy(this._onProfileSaved, this)
			});
		},

		render: function () {
			$.getJSON(new Tp.WebServiceURL('/api/v1/Projects.asmx/?include=[Id,Name]&take=1000').url, $.proxy(this._onProjectsReceived, this));
		},

		_onProjectsReceived: function (projects) {
			this._projects = projects.Items.sort(function (a, b) {
				return a.Name.toLocaleLowerCase().localeCompare(b.Name.toLocaleLowerCase());
			});

			this.repository.getCurrentProfile($.proxy(this._renderProfile, this));
		},

		_getEditingProfileName: function () {
			return this.repository.getCurrentProfileName();
		},

		_renderProfile: function (profile) {
			profile = profile || { Name: null, Settings: { CommndName: null, TasksList: null} };
			profile.projects = this._projects;
			this.placeHolder.html('');

			var rendered = $.tmpl(this.template, profile);
			rendered.appendTo(this.placeHolder);

			$('body').click($.proxy(this._toggleSamplePopup, this));

			this._setSelectedProject(profile);
			this._setFocus(profile.Name);

			new profileControlsBlock({ placeholder: this.placeHolder }).render();
		},

		_setFocus: function (name) {
			var nameInput = this.placeHolder.find('#profileNameTextBox');

			if (name != null) {
				this.placeHolder.find('#tasksListTextArea').focus();
				nameInput.attr('disabled', true);
			}
			else {
				nameInput.focus();
			}
		},

		_setSelectedProject: function (profile) {
			if (profile.Name) {
				$("#projectsDropDown").val(profile.Settings.Project);
			}
		},

		_saveProfile: function () {
			var project = this.placeHolder.find('#projectsDropDown').val();
			if (project == null)
				project = 0;

			var profile =
			{
				Name: this.placeHolder.find('#profileNameTextBox').val(),
				Settings:
				{
					Project: project
				}
			};

			if (this._getEditingProfileName()) {
				this.repository.update(profile);
			} else {
				this.repository.create(profile);
			}
		},

		_onProfileSaved: function (profile) {
			this._setFocus(profile.Name);
		}
	};

	new taskCreatorProfileEditor({
		placeHolder: $('#' + config.placeholderId)
	}).render();
})