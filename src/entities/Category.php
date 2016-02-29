<?php
/**
 * Created by PhpStorm.
 * User: david
 * Date: 29/02/16
 * Time: 12:39
 */

namespace SeArch\Entities;

/**
 * @Entity
 * @Table(name="website_categories")
 */
class Category {

	/**
	 * @Id @Column(type="integer")
	 * @GeneratedValue
	 */
	private $id;
	/** @Column(type="text") */
	private $name;

	/** @Column(type="integer") */
	private $order_legend;

	/** @Column(type="integer") */
	private $order_draw;

	/** @Column(type="boolean") */
	private $visible;

	/**
	 * @ManyToOne(targetEntity="Group", inversedBy="categories")
	 * @JoinColumn(name="group_id")
	 */
	private $group;

	/**
	 * @OneToMany(targetEntity="Layer", mappedBy="category")
	 * @OrderBy({"order_legend" = "ASC"})
	 **/
	private $layers;

	public function getName() {
		return $this->name;
	}

	public function isVisible() {
		return $this->visible;
	}

	public function getLayers() {
		return $this->layers;
	}

}
